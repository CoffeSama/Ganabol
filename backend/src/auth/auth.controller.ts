import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioActual, UsuarioAutenticado } from './decorators/usuario-actual.decorator';

class RefrescarDto {
  @IsString()
  refreshToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Autenticar y renovar no crean ningún recurso, de modo que la respuesta
  // correcta es 200 y no el 201 que el marco asigna por omisión a las
  // peticiones POST.
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autenticar usuario y obtener tokens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar el token de acceso' })
  refrescar(@Body() dto: RefrescarDto) {
    return this.authService.refrescar(dto.refreshToken);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Datos del usuario autenticado' })
  perfil(@UsuarioActual() usuario: UsuarioAutenticado) {
    return usuario;
  }
}
