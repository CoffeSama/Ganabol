import {
  IsDateString, IsEnum, IsOptional, IsString, Length, Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoEventoSanitario } from '@prisma/client';

const ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export class CrearEventoDto {
  @ApiProperty({ example: '01JGKQZ8XW4P7N2M5R8T3V6Y9B' })
  @Matches(ULID, { message: 'El identificador debe ser un ULID válido' })
  idEvento!: string;

  @ApiProperty({ example: '01JGKQZ8XW4P7N2M5R8T3V6Y9B' })
  @Matches(ULID, { message: 'El identificador del animal debe ser un ULID válido' })
  idAnimal!: string;

  @ApiPropertyOptional({
    description:
      'Protocolo del calendario que este evento cumple. Si se indica, solo se ' +
      'cierra la alerta de ese protocolo; si se omite, se cierran las del ' +
      'mismo tipo de evento.',
  })
  @IsOptional()
  @Matches(ULID, { message: 'El identificador del protocolo debe ser un ULID válido' })
  idPlan?: string;

  @ApiProperty({ enum: TipoEventoSanitario })
  @IsEnum(TipoEventoSanitario)
  tipo!: TipoEventoSanitario;

  @ApiPropertyOptional({ example: 'Aftosa bivalente' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  producto?: string;

  @ApiPropertyOptional({ example: '5 ml' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  dosis?: string;

  @ApiProperty({ example: '2026-10-02' })
  @IsDateString()
  fecha!: string;

  @ApiPropertyOptional({ example: 'Dr. Molina' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  responsable?: string;
}
