import { Options } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { Global, Injectable } from '@nestjs/common';
import { AmqpConnection, MessageHandlerErrorBehavior, RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

@Global()
@Injectable()
export class RabbitMQService {
  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  init(): RabbitMQConfig {
    const config: RabbitMQConfig = {
      uri: this.configService.get<string>('RABBITMQ.BASE_URL') + this.configService.get<string>('RABBITMQ.VIRTUAL_HOST_NAME'),
      exchanges: [
        {
          name: this.configService.get<string>('RABBITMQ.EXCHANGE_NAME'),
          type: this.configService.get<string>('RABBITMQ.EXCHANGE_TYPE'),
          options: {
            durable: true,
            autoDelete: false,
          },
        },
      ],
      defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK,
      prefetchCount: this.configService.get<number>('RABBITMQ.PREFETCH_COUNT'),
      connectionInitOptions: { wait: true, timeout: this.configService.get<number>('RABBITMQ.CONNECTION_TIMEOUT') },
    };
    return config;
  }

  async publish(
    routingKey: string,
    message: { [key: string]: any } = {},
    retryCount = 0,
    options: Options.Publish = {},
    exchangeName: string = this.configService.get<string>('RABBITMQ.EXCHANGE_NAME'),
  ): Promise<boolean> {
    if (retryCount) {
      options.headers = options?.headers || {};
      options.headers['x-retry'] = retryCount;
    }

    await this.amqpConnection.publish(exchangeName, routingKey, message, options);

    return true;
  }
}
