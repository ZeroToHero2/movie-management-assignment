import config from '@infrastructure/config';
import { applyDecorators } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

const CONFIG = config();

interface RabbitDecorator {
  NAME: string;
  ROUTING_KEY: string;
  RETRY_COUNT: number;
}

const subscriber = (queueName: string, routingKey: string) => ({
  queue: queueName,
  exchange: CONFIG.RABBITMQ.EXCHANGE_NAME,
  routingKey: routingKey,
  queueOptions: {
    durable: true,
    autoDelete: false,
  },
});

export const RabbitSubscriber = (queueInfo: RabbitDecorator) =>
  applyDecorators(RabbitSubscribe(subscriber(queueInfo.NAME, queueInfo.ROUTING_KEY)));
