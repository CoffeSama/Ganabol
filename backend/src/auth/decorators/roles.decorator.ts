import { SetMetadata } from '@nestjs/common';
import { Rol } from '@prisma/client';

export const ROLES_KEY = 'roles';

/// Restringe un endpoint a los roles indicados. Sin este decorador, el
/// endpoint queda disponible para cualquier usuario autenticado.
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
