import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CategoriaAnimal,
  EstadoAnimal,
  FaseManejo,
  Sexo,
} from '@prisma/client';

const ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export class CrearAnimalDto {
  /// ULID generado por el cliente, lo que permite dar de alta un animal sin
  /// conexión y consolidarlo después sin colisiones de identificador.
  @ApiProperty({ example: '01JGKQZ8XW4P7N2M5R8T3V6Y9B' })
  @Matches(ULID, { message: 'El identificador debe ser un ULID válido' })
  idAnimal!: string;

  @ApiProperty({ example: 'A-104', description: 'Número de caravana del animal' })
  @IsString()
  @Length(1, 20)
  caravana!: string;

  @ApiProperty({ enum: CategoriaAnimal })
  @IsEnum(CategoriaAnimal)
  categoria!: CategoriaAnimal;

  @ApiPropertyOptional({ example: 'Nelore' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  raza?: string;

  @ApiProperty({ enum: Sexo, description: 'M para macho, H para hembra' })
  @IsEnum(Sexo)
  sexo!: Sexo;

  @ApiPropertyOptional({ example: '2025-03-14' })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiProperty({ enum: FaseManejo })
  @IsEnum(FaseManejo)
  fase!: FaseManejo;

  @ApiPropertyOptional({ enum: EstadoAnimal })
  @IsOptional()
  @IsEnum(EstadoAnimal)
  estado?: EstadoAnimal;

  @ApiPropertyOptional({ description: 'Potrero en que se encuentra el animal' })
  @IsOptional()
  @Matches(ULID)
  idPotrero?: string;
}
