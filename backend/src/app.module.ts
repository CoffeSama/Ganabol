import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AnimalesModule } from './animales/animales.module';
import { PesajesModule } from './pesajes/pesajes.module';
import { SanidadModule } from './sanidad/sanidad.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AnimalesModule,
    PesajesModule,
    SanidadModule,
  ],
})
export class AppModule {}
