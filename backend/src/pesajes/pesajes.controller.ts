import {
  Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Rol } from '@prisma/client';
import { PesajesService } from './pesajes.service';
import { CrearPesajeDto } from './dto/crear-pesaje.dto';
import { CalibrarDto } from './dto/calibrar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('pesajes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pesajes')
export class PesajesController {
  constructor(private readonly pesajesService: PesajesService) {}

  @Post()
  @Roles(Rol.administrador, Rol.propietario, Rol.personal_campo)
  @ApiOperation({
    summary: 'Registrar un pesaje morfométrico',
    description:
      'El peso no se recibe: se calcula con la fórmula de Schaeffer a partir ' +
      'del perímetro torácico y el largo corporal.',
  })
  crear(@Body() dto: CrearPesajeDto) {
    return this.pesajesService.crear(dto);
  }

  @Get('cambios')
  @ApiOperation({ summary: 'Cambios desde una marca temporal (sincronización)' })
  cambios(@Query('desde') desde: string) {
    return this.pesajesService.cambiosDesde(new Date(desde));
  }

  @Get('ultimos')
  @ApiOperation({ summary: 'Último peso estimado de cada animal activo' })
  ultimos() {
    return this.pesajesService.ultimoPesoPorAnimal();
  }

  @Get('calibracion')
  @ApiOperation({ summary: 'Constante de la fórmula en vigor' })
  constanteEnVigor() {
    return this.pesajesService.calibracion();
  }

  @Post('calibracion')
  @Roles(Rol.administrador, Rol.propietario, Rol.veterinario)
  @ApiOperation({
    summary: 'Calibrar la constante contra una muestra de animales pesados',
    description:
      'Devuelve la constante que mejor ajusta la muestra y el error medio ' +
      'absoluto de la constante en vigor y de la calibrada, para contrastarlos ' +
      'con el objetivo del ocho por ciento.',
  })
  calibrar(@Body() dto: CalibrarDto) {
    return this.pesajesService.calibracion(dto.muestra);
  }

  @Get('animal/:idAnimal')
  @ApiOperation({
    summary: 'Historial de pesos de un animal con su ganancia media diaria',
  })
  historial(@Param('idAnimal') idAnimal: string) {
    return this.pesajesService.historial(idAnimal);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Rol.administrador, Rol.propietario)
  @ApiOperation({ summary: 'Dar de baja un pesaje (baja lógica)' })
  eliminar(@Param('id') id: string) {
    return this.pesajesService.eliminar(id);
  }
}
