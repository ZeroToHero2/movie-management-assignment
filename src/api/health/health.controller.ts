import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Public } from '@application/common/decorators';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TypeOrmHealthIndicator, HealthCheck, HealthCheckService, MicroserviceHealthIndicator } from '@nestjs/terminus';

@SkipThrottle()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @HealthCheck({ swaggerDocumentation: false })
  @Get('liveness')
  @ApiOperation({ summary: 'Check If the Application is Up' })
  @ApiResponse({ status: 200, description: 'The Application is Up and Running' })
  @ApiResponse({ status: 503, description: 'The Application is Down' })
  async livenessController(): Promise<{ status: string; timestamp: number }> {
    const { status } = await this.health.check([]);
    return { status, timestamp: Date.now() };
  }

  @Public()
  @HealthCheck()
  @Get('readiness')
  @ApiOperation({ summary: 'Check If the Application is Ready to Serve Requests' })
  @ApiResponse({ status: 200, description: 'The Application is Ready to Serve Requests' })
  @ApiResponse({ status: 503, description: 'The Application is Not Ready to Serve Requests' })
  async readinessController() {
    return this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck('PostgreSQL'),
      () =>
        this.microservice.pingCheck('Redis', {
          transport: Transport.TCP,
          options: {
            url: this.configService.get<string>('REDIS.URL'),
          },
        }),
      () =>
        this.microservice.pingCheck('RabbitMQ', {
          transport: Transport.TCP,
          options: {
            url: this.configService.get<string>('RABBITMQ.URL'),
          },
        }),
    ]);
  }
}
