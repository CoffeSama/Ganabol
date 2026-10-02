import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pesaje, Prisma } from '@prisma/client';
import { ulid } from 'ulid';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPesajeDto } from './dto/crear-pesaje.dto';
import {
  CONSTANTE_BIBLIOGRAFICA,
  MedidaFueraDeRangoError,
  calibrarConstante,
  errorMedioAbsoluto,
  estimarPeso,
  gananciaMediaDiaria,
} from './dominio/schaeffer';

/** Un pesaje con la ganancia diaria respecto del pesaje que lo precede. */
export interface PesajeConGanancia {
  pesaje: Pesaje;
  gananciaDiaria: number | null;
}

@Injectable()
export class PesajesService {
  /**
   * Constante de la fórmula en vigor.
   *
   * Se toma de la configuración del despliegue para que una recalibración no
   * requiera recompilar el servidor. El valor por omisión es el de la
   * bibliografía, que es el que corresponde mientras la calibración contra la
   * muestra de referencia local no se haya realizado.
   */
  private readonly constante: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    const configurada = Number(config.get('SCHAEFFER_CONSTANTE'));
    this.constante =
      Number.isFinite(configurada) && configurada > 0
        ? configurada
        : CONSTANTE_BIBLIOGRAFICA;
  }

  /**
   * Registra un pesaje calculando el peso a partir de las medidas.
   *
   * La operación es idempotente respecto del identificador que genera el
   * cliente: un reintento de sincronización reenvía el mismo pesaje y no debe
   * duplicar el historial de pesos del animal.
   */
  async crear(dto: CrearPesajeDto): Promise<Pesaje> {
    const existente = await this.prisma.pesaje.findUnique({
      where: { idPesaje: dto.idPesaje },
    });
    if (existente) return existente;

    const animal = await this.prisma.animal.findFirst({
      where: { idAnimal: dto.idAnimal, eliminado: false },
    });
    if (!animal) throw new NotFoundException('Animal no encontrado');

    // El peso se recalcula en el servidor en lugar de aceptarse del cliente.
    // Ambos aplican la misma fórmula, de modo que coinciden; la diferencia está
    // en que el servidor es el que custodia la constante en vigor y, si esta se
    // recalibra, el valor consolidado es el correcto.
    let calculo;
    try {
      calculo = estimarPeso(dto, this.constante);
    } catch (error) {
      if (error instanceof MedidaFueraDeRangoError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    return this.prisma.$transaction(async (tx) => {
      const pesaje = await tx.pesaje.create({
        data: {
          idPesaje: dto.idPesaje,
          idAnimal: dto.idAnimal,
          fecha: new Date(dto.fecha),
          perimetroToracico: new Prisma.Decimal(dto.perimetroToracico),
          largoCorporal: new Prisma.Decimal(dto.largoCorporal),
          pesoEstimado: new Prisma.Decimal(calculo.pesoEstimado),
          constante: new Prisma.Decimal(calculo.constante),
        },
      });
      await this.registrarSync(tx, 'pesaje', pesaje.idPesaje, 'alta');
      return pesaje;
    });
  }

  /**
   * Historial de pesos de un animal, del más reciente al más antiguo, con la
   * ganancia media diaria de cada medición respecto de la anterior.
   */
  async historial(idAnimal: string): Promise<PesajeConGanancia[]> {
    const animal = await this.prisma.animal.findFirst({
      where: { idAnimal, eliminado: false },
    });
    if (!animal) throw new NotFoundException('Animal no encontrado');

    const pesajes = await this.prisma.pesaje.findMany({
      where: { idAnimal, eliminado: false },
      orderBy: { fecha: 'asc' },
    });

    const conGanancia = pesajes.map((pesaje, i) => ({
      pesaje,
      gananciaDiaria:
        i === 0
          ? null
          : gananciaMediaDiaria(
              {
                fecha: pesajes[i - 1].fecha,
                pesoEstimado: pesajes[i - 1].pesoEstimado.toNumber(),
              },
              { fecha: pesaje.fecha, pesoEstimado: pesaje.pesoEstimado.toNumber() },
            ),
    }));

    return conGanancia.reverse();
  }

  /** Último peso estimado de cada animal activo del hato. */
  async ultimoPesoPorAnimal() {
    // Un animal tiene muchos pesajes y solo interesa el más reciente. La
    // consulta se resuelve en la base con una función de ventana en lugar de
    // traer el historial completo y descartarlo en memoria.
    return this.prisma.$queryRaw<
      Array<{
        id_animal: string;
        caravana: string;
        fecha: Date;
        peso_estimado: Prisma.Decimal;
      }>
    >`
      SELECT a.id_animal, a.caravana, p.fecha, p.peso_estimado
        FROM animal a
        JOIN (
          SELECT id_animal, fecha, peso_estimado,
                 ROW_NUMBER() OVER (
                   PARTITION BY id_animal ORDER BY fecha DESC, actualizado_en DESC
                 ) AS orden
            FROM pesaje
           WHERE eliminado = FALSE
        ) p ON p.id_animal = a.id_animal AND p.orden = 1
       WHERE a.eliminado = FALSE AND a.estado = 'activo'
       ORDER BY a.caravana
    `;
  }

  async eliminar(idPesaje: string): Promise<void> {
    const pesaje = await this.prisma.pesaje.findFirst({
      where: { idPesaje, eliminado: false },
    });
    if (!pesaje) throw new NotFoundException('Pesaje no encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.pesaje.update({ where: { idPesaje }, data: { eliminado: true } });
      await this.registrarSync(tx, 'pesaje', idPesaje, 'baja');
    });
  }

  /** Cambios desde una marca temporal, para la sincronización incremental. */
  async cambiosDesde(desde: Date) {
    const pesajes = await this.prisma.pesaje.findMany({
      where: { actualizadoEn: { gt: desde } },
      orderBy: { actualizadoEn: 'asc' },
    });

    return { pesajes, sincronizadoHasta: new Date() };
  }

  /**
   * Constante en vigor y, cuando se aporta una muestra de animales pesados, la
   * constante que mejor la ajusta y el error medio de ambas.
   *
   * Es el procedimiento que el diseño exige para validar el método contra la
   * muestra de referencia: permite comprobar si la constante bibliográfica
   * cumple el objetivo del ocho por ciento de error o si el ganado de la zona
   * requiere una calibración propia.
   */
  calibracion(muestra?: ReadonlyArray<{
    perimetroToracico: number;
    largoCorporal: number;
    pesoReal: number;
  }>) {
    if (!muestra || muestra.length === 0) {
      return { constanteEnVigor: this.constante, muestra: 0 };
    }

    try {
      const calibrada = calibrarConstante(muestra);
      return {
        constanteEnVigor: this.constante,
        muestra: muestra.length,
        errorEnVigor: errorMedioAbsoluto(muestra, this.constante),
        constanteCalibrada: calibrada,
        errorCalibrada: errorMedioAbsoluto(muestra, calibrada),
      };
    } catch (error) {
      if (error instanceof MedidaFueraDeRangoError || error instanceof RangeError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private async registrarSync(
    tx: Prisma.TransactionClient,
    entidad: string,
    idEntidad: string,
    operacion: 'alta' | 'modificacion' | 'baja',
  ): Promise<void> {
    await tx.registroSync.create({
      data: {
        idRegistro: ulid(),
        entidad,
        idEntidad,
        operacion,
        estado: 'sincronizado',
        marcaTiempo: new Date(),
      },
    });
  }
}
