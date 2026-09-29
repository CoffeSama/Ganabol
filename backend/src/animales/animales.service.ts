import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Animal, Prisma, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ActualizarAnimalDto } from './dto/actualizar-animal.dto';
import { ConsultarAnimalesDto } from './dto/consultar-animales.dto';
import { UsuarioAutenticado } from '../auth/decorators/usuario-actual.decorator';

@Injectable()
export class AnimalesService {
  constructor(private readonly prisma: PrismaService) {}

  /// El ADMINISTRADOR opera sobre cualquier predio; el resto de los roles
  /// queda acotado al predio que tiene asignado.
  private resolverPredio(usuario: UsuarioAutenticado): string {
    if (!usuario.predioId) {
      throw new ForbiddenException(
        'El usuario no tiene un predio asignado',
      );
    }
    return usuario.predioId;
  }

  async crear(dto: CrearAnimalDto, usuario: UsuarioAutenticado): Promise<Animal> {
    const predioId = this.resolverPredio(usuario);

    // El cliente genera el ULID sin conexión, así que un reintento de
    // sincronización puede reenviar un animal ya registrado. Se trata como
    // operación idempotente en lugar de devolver un error al dispositivo.
    const existente = await this.prisma.animal.findUnique({
      where: { id: dto.id },
    });
    if (existente) return existente;

    try {
      return await this.prisma.animal.create({
        data: {
          id: dto.id,
          caravana: dto.caravana,
          nombre: dto.nombre,
          sexo: dto.sexo,
          raza: dto.raza,
          fechaNacimiento: dto.fechaNacimiento
            ? new Date(dto.fechaNacimiento)
            : null,
          categoria: dto.categoria,
          fase: dto.fase,
          estado: dto.estado,
          madreId: dto.madreId,
          observaciones: dto.observaciones,
          predioId,
          registradoPorId: usuario.id,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe un animal con la caravana ${dto.caravana} en este predio`,
        );
      }
      throw error;
    }
  }

  async listar(query: ConsultarAnimalesDto, usuario: UsuarioAutenticado) {
    const predioId = this.resolverPredio(usuario);
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 50;

    const where: Prisma.AnimalWhereInput = {
      predioId,
      deletedAt: null,
      ...(query.estado && { estado: query.estado }),
      ...(query.fase && { fase: query.fase }),
      ...(query.buscar && {
        OR: [
          { caravana: { contains: query.buscar, mode: 'insensitive' } },
          { nombre: { contains: query.buscar, mode: 'insensitive' } },
        ],
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

  async obtener(id: string, usuario: UsuarioAutenticado): Promise<Animal> {
    const animal = await this.prisma.animal.findFirst({
      where: { id, predioId: this.resolverPredio(usuario), deletedAt: null },
    });
    if (!animal) throw new NotFoundException('Animal no encontrado');
    return animal;
  }

  async actualizar(
    id: string,
    dto: ActualizarAnimalDto,
    usuario: UsuarioAutenticado,
  ): Promise<Animal> {
    await this.obtener(id, usuario);

    return this.prisma.animal.update({
      where: { id },
      data: {
        ...dto,
        fechaNacimiento: dto.fechaNacimiento
          ? new Date(dto.fechaNacimiento)
          : undefined,
      },
    });
  }

  /// Baja lógica: la sincronización necesita propagar la eliminación a los
  /// dispositivos, y un DELETE físico no deja rastro que transmitir.
  async eliminar(id: string, usuario: UsuarioAutenticado): Promise<void> {
    await this.obtener(id, usuario);
    await this.prisma.animal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /// Devuelve los animales modificados desde `desde`, incluidos los dados de
  /// baja, para que el dispositivo actualice su base local.
  async cambiosDesde(desde: Date, usuario: UsuarioAutenticado) {
    const animales = await this.prisma.animal.findMany({
      where: {
        predioId: this.resolverPredio(usuario),
        updatedAt: { gt: desde },
      },
      orderBy: { updatedAt: 'asc' },
    });

    return { animales, sincronizadoHasta: new Date() };
  }

  static rolPuedeEditar(rol: Rol): boolean {
    return rol !== Rol.VETERINARIO;
  }
}
