import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoAnimal, FaseManejo } from '@prisma/client';

export class ConsultarAnimalesDto {
  @ApiPropertyOptional({ enum: EstadoAnimal })
  @IsOptional()
  @IsEnum(EstadoAnimal)
  estado?: EstadoAnimal;

  @ApiPropertyOptional({ enum: FaseManejo })
  @IsOptional()
  @IsEnum(FaseManejo)
  fase?: FaseManejo;

  @ApiPropertyOptional({ description: 'Filtra por potrero' })
  @IsOptional()
  @Matches(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  idPotrero?: string;

  @ApiPropertyOptional({ description: 'Busca por número de caravana' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ default: 50, maximum: 200 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200)
  limite?: number = 50;
}
