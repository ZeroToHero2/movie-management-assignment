import { Reflector } from '@nestjs/core';
import { Role } from '@domain/auth/enums/role.enum';
import { ForbiddenError } from '@domain/exceptions';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const shouldSkip = isRabbitContext(context);

    if (shouldSkip) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [context.getHandler(), context.getClass()]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const isAuthorized = requiredRoles.some((role) => user?.role === role);

    if (!isAuthorized) {
      throw new ForbiddenError();
    }

    return true;
  }
}
