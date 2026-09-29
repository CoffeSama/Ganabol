import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaAnimal, EstadoAnimal, FaseProductiva, Sexo } from '@prisma/client';

export class CrearAnimalDto {
  /// ULID generado por el cliente. Permite registrar animales sin conexión
  /// y sincronizarlos después sin colisiones de identificador.
  @ApiProperty({ example: '01JGKQZ8XW4P7N2M5R8T3V6Y9B' })
  @IsString()
  @Matches(/^[0-9A-HJKMNP-TV-Z]{26}$/, { message: 'El id debe ser un ULID válido' })
  id!: string;

  @ApiProperty({ example: 'A-104' })
  @IsString()
  @Length(1, 30)
  caravana!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 80)
  nombre?: string;

  @ApiProperty({ enum: Sexo })
  @IsEnum(Sexo)
  sexo!: Sexo;

  @ApiPropertyOptional({ example: 'Nelore' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  raza?: string;

  @ApiPropertyOptional({ example: '2025-03-14' })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiProperty({ enum: CategoriaAnimal })
  @IsEnum(CategoriaAnimal)
  categoria!: CategoriaAnimal;

  @ApiPropertyOptional({ enum: FaseProductiva })
  @IsOptional()
  @IsEnum(FaseProductiva)
  fase?: FaseProductiva;

  @ApiPropertyOptional({ enum: EstadoAnimal })
  @IsOptional()
  @IsEnum(EstadoAnimal)
  estado?: EstadoAnimal;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  madreId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  observaciones?: string;
}
