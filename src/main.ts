import { AppModule } from './app.module';
import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { BootstrapSwagger } from '@application/common/bootstrap';
import { BootstrapTransactions } from '@application/common/bootstrap/transactions.bootstrap';

async function bootstrap() {
  BootstrapTransactions();
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  app.useLogger([configService.get('LOGGER.LEVEL')] as LogLevel[]);

  //? Bootstrap Cross Cutting Concerns
  BootstrapSwagger(app, configService);
  await app.listen(configService.get<string>('APP.PORT'));
}

bootstrap();
