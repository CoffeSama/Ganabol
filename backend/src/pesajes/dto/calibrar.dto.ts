import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RANGOS } from '../dominio/schaeffer';

/** Un animal de la muestra de referencia: sus medidas y su peso real pesado. */
export class AnimalDeReferenciaDto {
  @ApiProperty({ example: 178.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(RANGOS.perimetroToracico.min)
  @Max(RANGOS.perimetroToracico.max)
  perimetroToracico!: number;

  @ApiProperty({ example: 146 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(RANGOS.largoCorporal.min)
  @Max(RANGOS.largoCorporal.max)
  largoCorporal!: number;

  @ApiProperty({ example: 432, description: 'Peso real obtenido en báscula' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(RANGOS.pesoEstimado.min)
  @Max(RANGOS.pesoEstimado.max)
  pesoReal!: number;
}

export class CalibrarDto {
  @ApiProperty({ type: [AnimalDeReferenciaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnimalDeReferenciaDto)
  muestra!: AnimalDeReferenciaDto[];
}
