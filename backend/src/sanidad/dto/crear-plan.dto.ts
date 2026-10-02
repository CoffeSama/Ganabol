import {
  IsEnum, IsInt, IsOptional, IsString, Length, Matches, Max, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaAnimal, TipoEventoPlan } from '@prisma/client';

const ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export class CrearPlanDto {
  @ApiProperty({ example: '01JGKQZ8XW4P7N2M5R8T3V6Y9B' })
  @Matches(ULID, { message: 'El identificador debe ser un ULID válido' })
  idPlan!: string;

  @ApiProperty({ example: 'Vacunación antiaftosa' })
  @IsString()
  @Length(1, 100)
  nombre!: string;

  @ApiPropertyOptional({
    enum: CategoriaAnimal,
    description: 'Categoría a la que aplica; si se omite, aplica a todo el hato',
  })
  @IsOptional()
  @IsEnum(CategoriaAnimal)
  categoria?: CategoriaAnimal;

  @ApiProperty({ enum: TipoEventoPlan })
  @IsEnum(TipoEventoPlan)
  tipoEvento!: TipoEventoPlan;

  @ApiProperty({ example: 180, description: 'Días entre aplicaciones' })
  @IsInt()
  @Min(1)
  @Max(3650)
  periodicidadDias!: number;

  @ApiPropertyOptional({ example: 'Campaña oficial del SENASAG, dos veces al año' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  descripcion?: string;
}
