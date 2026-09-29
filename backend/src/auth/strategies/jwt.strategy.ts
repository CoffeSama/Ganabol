import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UsuarioAutenticado } from '../decorators/usuario-actual.decorator';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  /// Se revalida el usuario contra la base en cada petición: un usuario dado
  /// de baja no debe seguir operando con un token aún vigente.
  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: payload.sub, activo: true, deletedAt: null },
      select: { id: true, email: true, rol: true, predioId: true },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no habilitado');
    return usuario;
  }
}
