import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { Module, ValidationPipe } from '@nestjs/common';
import { HealthModule } from '@api/health/health.module';
import { AuthModule } from '@application/auth/auth.module';
import { BootstrapApp } from '@application/common/bootstrap';
import { UsersModule } from '@application/users/users.module';
import { MoviesModule } from '@application/movies/movies.module';
import { HttpExceptionFilter } from '@application/common/filters';
import { ConfigModule } from '@infrastructure/config/config.module';
import { TicketsModule } from '@application/tickets/tickets.module';
import { RolesGuard, JwtAuthGuard } from '@application/common/guards';
import { CryptoModule } from '@application/auth/crypto/crypto.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import HttpThrottlerGuard from '@application/common/guards/throttler.guard';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggingInterceptor, TimeoutInterceptor } from '@application/common/interceptors';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    TicketsModule,
    HealthModule,
    CryptoModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE.TTL'),
            limit: config.get('THROTTLE.LIMIT'),
          },
        ],
        storage: new ThrottlerStorageRedisService(config.get('REDIS.URL')),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BootstrapApp,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
