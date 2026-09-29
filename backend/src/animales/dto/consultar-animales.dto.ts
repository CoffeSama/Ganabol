import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoAnimal, FaseProductiva } from '@prisma/client';

export class ConsultarAnimalesDto {
  @ApiPropertyOptional({ enum: EstadoAnimal })
  @IsOptional()
  @IsEnum(EstadoAnimal)
  estado?: EstadoAnimal;

  @ApiPropertyOptional({ enum: FaseProductiva })
  @IsOptional()
  @IsEnum(FaseProductiva)
  fase?: FaseProductiva;

  @ApiPropertyOptional({ description: 'Busca por caravana o nombre' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ default: 50, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limite?: number = 50;
}
