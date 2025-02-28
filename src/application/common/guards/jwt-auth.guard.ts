import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedError } from '@domain/exceptions';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { JwtService } from '@application/auth/jwt/jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { CryptoService } from '@application/auth/crypto/crypto.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldSkip = isRabbitContext(context);

    if (shouldSkip) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedError();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const decryptedPayload = await this.cryptoService.decrypt(payload);

      request['user'] = decryptedPayload;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedError();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
