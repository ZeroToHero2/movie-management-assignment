import { RateLimitExceedError } from '@domain/exceptions';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';

@Injectable()
export default class HttpThrottlerGuard extends ThrottlerGuard {
  async handleRequest(context: ExecutionContext, limit: number, ttl: number, throttler: ThrottlerOptions): Promise<boolean> {
    const shouldSkip = isRabbitContext(context);

    if (shouldSkip) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const ip = req.ip || this.extractIpFromHeaders(req) || req?.connection?.remoteAddress;

    //? Generating a key based on the context, IP address, and the name of the throttler
    const key = this.generateKey(context, ip, throttler.name);
    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new RateLimitExceedError();
    }

    return true;
  }

  private extractIpFromHeaders(req): string | null {
    //? Extracting the IP address from the X-Forwarded-For header or similar
    const forwarded = req?.headers?.['x-forwarded-for'];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    return ip || null;
  }
}
