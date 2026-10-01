import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Animal, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ActualizarAnimalDto } from './dto/actualizar-animal.dto';
import { ConsultarAnimalesDto } from './dto/consultar-animales.dto';
import { UsuarioAutenticado } from '../auth/decorators/usuario-actual.decorator';

@Injectable()
export class AnimalesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearAnimalDto, usuario: UsuarioAutenticado): Promise<Animal> {
    // El cliente genera el ULID sin conexión, de modo que un reintento de
    // sincronización puede reenviar un animal ya consolidado. La operación es
    // idempotente: el reenvío actualiza, nunca duplica.
    const existente = await this.prisma.animal.findUnique({
      where: { idAnimal: dto.idAnimal },
    });
    if (existente) return existente;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const animal = await tx.animal.create({
          data: {
            idAnimal: dto.idAnimal,
            idUsuario: usuario.idUsuario,
            idPotrero: dto.idPotrero,
            caravana: dto.caravana,
            categoria: dto.categoria,
            raza: dto.raza,
            sexo: dto.sexo,
            fechaNacimiento: dto.fechaNacimiento
              ? new Date(dto.fechaNacimiento)
              : null,
            fase: dto.fase,
            estado: dto.estado,
          },
        });
        await this.registrarSync(tx, 'animal', animal.idAnimal, 'alta');
        return animal;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe un animal con la caravana ${dto.caravana}`,
        );
      }
      throw error;
    }
  }

  async listar(query: ConsultarAnimalesDto) {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 50;

    const where: Prisma.AnimalWhereInput = {
      eliminado: false,
      ...(query.estado && { estado: query.estado }),
      ...(query.fase && { fase: query.fase }),
      ...(query.idPotrero && { idPotrero: query.idPotrero }),
      ...(query.buscar && {
        caravana: { contains: query.buscar, mode: 'insensitive' },
      }),
    };

    const [datos, total] = await Promise.all([
      this.prisma.animal.findMany({
        where,
        orderBy: { caravana: 'asc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.prisma.animal.count({ where }),
    ]);

    return { datos, total, pagina, limite };
  }

  async obtener(idAnimal: string): Promise<Animal> {
    const animal = await this.prisma.animal.findFirst({
      where: { idAnimal, eliminado: false },
    });
    if (!animal) throw new NotFoundException('Animal no encontrado');
    return animal;
  }

  async actualizar(
    idAnimal: string,
    dto: ActualizarAnimalDto,
  ): Promise<Animal> {
    await this.obtener(idAnimal);

    return this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.update({
        where: { idAnimal },
        data: {
          ...dto,
          fechaNacimiento: dto.fechaNacimiento
            ? new Date(dto.fechaNacimiento)
            : undefined,
        },
      });
      await this.registrarSync(tx, 'animal', idAnimal, 'modificacion');
      return animal;
    });
  }

  /// Baja lógica. La sincronización necesita propagar la eliminación a los
  /// dispositivos, y un borrado físico no deja rastro que transmitir.
  async eliminar(idAnimal: string): Promise<void> {
    await this.obtener(idAnimal);

    await this.prisma.$transaction(async (tx) => {
      await tx.animal.update({
        where: { idAnimal },
        data: { eliminado: true },
      });
      await this.registrarSync(tx, 'animal', idAnimal, 'baja');
    });
  }

  /// Devuelve los animales modificados desde la marca indicada, incluidos los
  /// dados de baja, para que el dispositivo actualice su base local.
  ///
  /// La sincronización es incremental: el dispositivo conserva el cursor de la
  /// última consolidación y recibe solo lo cambiado desde entonces, en lugar
  /// de la tabla completa.
  async cambiosDesde(desde: Date) {
    const animales = await this.prisma.animal.findMany({
      where: { actualizadoEn: { gt: desde } },
      orderBy: { actualizadoEn: 'asc' },
    });

    return { animales, sincronizadoHasta: new Date() };
  }

  /// Deja constancia del cambio en la bitácora de sincronización, dentro de la
  /// misma transacción que lo produjo.
  private async registrarSync(
    tx: Prisma.TransactionClient,
    entidad: string,
    idEntidad: string,
    operacion: 'alta' | 'modificacion' | 'baja',
  ): Promise<void> {
    const { ulid } = await import('ulid');
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
