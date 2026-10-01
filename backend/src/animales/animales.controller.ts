import {
  Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Rol } from '@prisma/client';
import { AnimalesService } from './animales.service';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ActualizarAnimalDto } from './dto/actualizar-animal.dto';
import { ConsultarAnimalesDto } from './dto/consultar-animales.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual, UsuarioAutenticado } from '../auth/decorators/usuario-actual.decorator';

@ApiTags('animales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('animales')
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  @Post()
  @Roles(Rol.administrador, Rol.propietario, Rol.personal_campo)
  @ApiOperation({ summary: 'Registrar un animal en el hato' })
  crear(@Body() dto: CrearAnimalDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.animalesService.crear(dto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar los animales del hato' })
  listar(@Query() query: ConsultarAnimalesDto) {
    return this.animalesService.listar(query);
  }

  @Get('cambios')
  @ApiOperation({ summary: 'Cambios desde una marca temporal (sincronización)' })
  cambios(@Query('desde') desde: string) {
    return this.animalesService.cambiosDesde(new Date(desde));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un animal por su identificador' })
  obtener(@Param('id') id: string) {
    return this.animalesService.obtener(id);
  }

  @Patch(':id')
  @Roles(Rol.administrador, Rol.propietario, Rol.personal_campo)
  @ApiOperation({ summary: 'Actualizar los datos de un animal' })
  actualizar(@Param('id') id: string, @Body() dto: ActualizarAnimalDto) {
    return this.animalesService.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Rol.administrador, Rol.propietario)
  @ApiOperation({ summary: 'Dar de baja un animal (baja lógica)' })
  eliminar(@Param('id') id: string) {
    return this.animalesService.eliminar(id);
  }
}
