import { Module } from '@nestjs/common';
import { SanidadService } from './sanidad.service';
import { SanidadController } from './sanidad.controller';

@Module({
  providers: [SanidadService],
  controllers: [SanidadController],
  exports: [SanidadService],
})
export class SanidadModule {}
