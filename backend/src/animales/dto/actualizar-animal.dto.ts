import { OmitType, PartialType } from '@nestjs/swagger';
import { CrearAnimalDto } from './crear-animal.dto';

/// El identificador no se modifica: es la clave de correlación entre el
/// registro local del dispositivo y el del servidor.
export class ActualizarAnimalDto extends PartialType(
  OmitType(CrearAnimalDto, ['idAnimal'] as const),
) {}
