import { Module } from '@nestjs/common';
import { AnimalesService } from './animales.service';
import { AnimalesController } from './animales.controller';

@Module({
  providers: [AnimalesService],
  controllers: [AnimalesController],
  exports: [AnimalesService],
})
export class AnimalesModule {}
