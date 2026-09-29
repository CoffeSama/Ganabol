import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface RespuestaLogin {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    predioId: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<RespuestaLogin> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
    });

    // Se compara el hash aun cuando el usuario no existe, para que el tiempo
    // de respuesta no revele qué correos están registrados.
    const hashComparable =
      usuario?.passwordHash ??
      '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const passwordValida = await bcrypt.compare(dto.password, hashComparable);

    if (!usuario || !passwordValida || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAccesoAt: new Date() },
    });

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };

    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '60d',
      }),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        predioId: usuario.predioId,
      },
    };
  }

  /// Renueva el access token a partir de un refresh token de larga duración.
  /// El refresh vive 60 días porque el productor puede pasar semanas sin
  /// conectividad y no debe quedar fuera del sistema al volver a tener señal.
  async refrescar(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const usuario = await this.prisma.usuario.findFirst({
        where: { id: payload.sub, activo: true, deletedAt: null },
      });
      if (!usuario) throw new UnauthorizedException();

      return {
        accessToken: this.jwt.sign({
          sub: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
        }),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
