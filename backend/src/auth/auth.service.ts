import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface RespuestaLogin {
  accessToken: string;
  refreshToken: string;
  usuario: {
    idUsuario: string;
    email: string;
    nombre: string;
    rol: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /// Parámetros de argon2id exigidos por el RNF1. El tipo argon2id combina la
  /// resistencia a ataques por canal lateral del argon2i con la resistencia a
  /// ataques por hardware dedicado del argon2d.
  private static readonly OPCIONES_HASH: argon2.HashOptions = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  };

  async login(dto: LoginDto): Promise<RespuestaLogin> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    // Se verifica el resumen aun cuando el usuario no existe, para que el
    // tiempo de respuesta no revele qué correos están registrados.
    const passwordValida = usuario
      ? await argon2.verify(usuario.passwordHash, dto.password)
      : await AuthService.verificarSenuelo(dto.password);

    if (!usuario || !passwordValida || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.usuario.update({
      where: { idUsuario: usuario.idUsuario },
      data: { ultimoAccesoEn: new Date() },
    });

    const payload = {
      sub: usuario.idUsuario,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '60d',
      }),
      usuario: {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }

  /// Renueva el token de acceso a partir del token de actualización.
  ///
  /// El token de actualización tiene una vigencia larga porque el productor
  /// puede pasar semanas sin conectividad y no debe quedar fuera del sistema
  /// al volver a tener señal.
  async refrescar(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const usuario = await this.prisma.usuario.findFirst({
        where: { idUsuario: payload.sub, activo: true },
      });
      if (!usuario) throw new UnauthorizedException();

      return {
        accessToken: this.jwt.sign({
          sub: usuario.idUsuario,
          email: usuario.email,
          rol: usuario.rol,
        }),
      };
    } catch {
      throw new UnauthorizedException('Token de actualización inválido o expirado');
    }
  }

  static hashPassword(password: string): Promise<string> {
    return argon2.hash(password, AuthService.OPCIONES_HASH);
  }

  /// Resumen de referencia con el que comparar cuando el correo no existe, de
  /// modo que el costo de la verificación sea equivalente en ambos casos.
  private static senuelo: string | null = null;
  private static async verificarSenuelo(password: string): Promise<boolean> {
    AuthService.senuelo ??= await AuthService.hashPassword(
      'contrasena-inexistente',
    );
    await argon2.verify(AuthService.senuelo, password);
    return false;
  }
}
