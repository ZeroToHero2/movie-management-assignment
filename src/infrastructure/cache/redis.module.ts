import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import RedisClientService from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export default class RedisClientModule {}
