import appConfig from './index';
import { Global, Module } from '@nestjs/common';
import configValidator from './config.validation';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: configValidator,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
