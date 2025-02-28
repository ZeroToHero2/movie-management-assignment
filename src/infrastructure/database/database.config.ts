import { Environment } from '@application/common/enums';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    url: configService.get<string>('DATABASE.URL'),
    type: 'postgres',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === Environment.DEV, //? Setted as False for production
    retryAttempts: configService.get<number>('DATABASE.RETRY_ATTEMPTS'),
    retryDelay: configService.get<number>('DATABASE.RETRY_DELAY'),
    maxQueryExecutionTime: configService.get<number>('DATABASE.MAX_QUERY_EXECUTION_TIME'),
    poolSize: configService.get<number>('DATABASE.POOL_SIZE'),
    extra: {
      max: configService.get<number>('DATABASE.MAX'),
      min: configService.get<number>('DATABASE.MIN'),
      idleTimeoutMillis: configService.get<number>('DATABASE.IDLE_TIMEOUT_MILLIS'),
    },
  }),
  dataSourceFactory: async (options) => {
    if (!options) {
      throw new Error('Invalid options passed');
    }
    return addTransactionalDataSource(new DataSource(options));
  },
  inject: [ConfigService],
};
