import {
  Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EstadoAlerta, Rol } from '@prisma/client';
import { SanidadService } from './sanidad.service';
import { CrearEventoDto } from './dto/crear-evento.dto';
import { CrearPlanDto } from './dto/crear-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('sanidad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sanidad')
export class SanidadController {
  constructor(private readonly sanidadService: SanidadService) {}

  // --- Eventos sanitarios ---------------------------------------------------

  @Post('eventos')
  @Roles(Rol.administrador, Rol.propietario, Rol.personal_campo, Rol.veterinario)
  @ApiOperation({
    summary: 'Registrar un evento sanitario',
    description:
      'Registra el evento y cierra en la misma transacción las alertas del ' +
      'calendario que ese evento viene a cumplir.',
  })
  registrarEvento(@Body() dto: CrearEventoDto) {
    return this.sanidadService.registrarEvento(dto);
  }

  @Get('eventos/animal/:idAnimal')
  @ApiOperation({ summary: 'Historial sanitario de un animal' })
  historial(@Param('idAnimal') idAnimal: string) {
    return this.sanidadService.historial(idAnimal);
  }

  @Delete('eventos/:id')
  @HttpCode(204)
  @Roles(Rol.administrador, Rol.propietario, Rol.veterinario)
  @ApiOperation({ summary: 'Dar de baja un evento sanitario (baja lógica)' })
  eliminarEvento(@Param('id') id: string) {
    return this.sanidadService.eliminarEvento(id);
  }

  // --- Planes sanitarios ----------------------------------------------------

  @Post('planes')
  @Roles(Rol.administrador, Rol.propietario, Rol.veterinario)
  @ApiOperation({ summary: 'Configurar un protocolo sanitario' })
  crearPlan(@Body() dto: CrearPlanDto) {
    return this.sanidadService.crearPlan(dto);
  }

  @Get('planes')
  @ApiOperation({ summary: 'Listar los protocolos sanitarios configurados' })
  listarPlanes() {
    return this.sanidadService.listarPlanes();
  }

  // --- Calendario de alertas ------------------------------------------------

  @Post('calendario')
  @Roles(Rol.administrador, Rol.propietario, Rol.veterinario)
  @ApiOperation({
    summary: 'Regenerar el calendario de alertas del hato',
    description:
      'Operación idempotente: ejecutarla dos veces seguidas no altera el ' +
      'calendario resultante.',
  })
  regenerar() {
    return this.sanidadService.regenerarCalendario();
  }

  @Get('alertas')
  @ApiQuery({ name: 'estado', enum: EstadoAlerta, required: false })
  @ApiOperation({
    summary: 'Alertas del calendario, de la más urgente a la menos urgente',
    description: 'Sin filtro devuelve las abiertas: vencidas y pendientes.',
  })
  listarAlertas(@Query('estado') estado?: EstadoAlerta) {
    return this.sanidadService.listarAlertas(estado);
  }

  @Get('alertas/resumen')
  @ApiOperation({ summary: 'Recuento de alertas por estado' })
  resumen() {
    return this.sanidadService.resumenAlertas();
  }

  @Get('cambios')
  @ApiOperation({ summary: 'Cambios desde una marca temporal (sincronización)' })
  cambios(@Query('desde') desde: string) {
    return this.sanidadService.cambiosDesde(new Date(desde));
  }
}
