import { IsDateString, IsNumber, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RANGOS } from '../dominio/schaeffer';

const ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/**
 * Alta de un pesaje morfométrico.
 *
 * El peso no figura entre los campos de entrada: es un valor calculado, y el
 * servidor lo deriva de las medidas. Aceptarlo del cliente permitiría registrar
 * un peso que no se corresponde con las medidas que lo acompañan, y sería
 * además el único dato del sistema cuya integridad no podría verificarse.
 */
export class CrearPesajeDto {
  @ApiProperty({ example: '01JGKQZ8XW4P7N2M5R8T3V6Y9B' })
  @Matches(ULID, { message: 'El identificador debe ser un ULID válido' })
  idPesaje!: string;

  @ApiProperty({ example: '01JGKQZ8XW4P7N2M5R8T3V6Y9B' })
  @Matches(ULID, { message: 'El identificador del animal debe ser un ULID válido' })
  idAnimal!: string;

  @ApiProperty({ example: '2026-10-02', description: 'Fecha de la medición' })
  @IsDateString()
  fecha!: string;

  @ApiProperty({
    example: 178.5,
    description:
      'Perímetro torácico en centímetros, medido justo detrás de la paleta ' +
      'con el animal en posición cuadrada',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(RANGOS.perimetroToracico.min)
  @Max(RANGOS.perimetroToracico.max)
  perimetroToracico!: number;

  @ApiProperty({ example: 146, description: 'Largo corporal en centímetros' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(RANGOS.largoCorporal.min)
  @Max(RANGOS.largoCorporal.max)
  largoCorporal!: number;
}
