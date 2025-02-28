import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AmqpConnection, RabbitMQModule as RabbitModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService, amqpConnection: AmqpConnection) =>
        new RabbitMQService(configService, amqpConnection).init(),
    }),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export default class RabbitMQModule {}
