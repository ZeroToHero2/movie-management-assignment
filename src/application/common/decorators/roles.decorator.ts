import { SetMetadata } from '@nestjs/common';
import { Role } from '@domain/auth/enums/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
