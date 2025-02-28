import { Environment } from '@application/common/enums';

export default {
  ENV: Environment.DEV,
  LOGGER: {
    LEVEL: process.env.LOG_LEVEL || 'debug',
  },
  DATABASE: {
    URL: process.env.DATABASE_URL,
    TYPE: 'postgres',
    SYNCHRONIZE: false,
    ENTITIES: [__dirname + '/../../**/*.entity{.ts,.js}'],
    RETRY_ATTEMPTS: process.env.DATABASE_RETRY_ATTEMPTS || 10,
    RETRY_DELAY: process.env.DATABASE_RETRY_DELAY || 500,
    MAX_QUERY_EXECUTION_TIME: process.env.DATABASE_MAX_QUERY_EXECUTION_TIME || 5000,
    POOL_SIZE: process.env.DATABASE_POOL_SIZE || 2,
    MAX: process.env.DATABASE_MAX || 2,
    MIN: process.env.DATABASE_MIN || 1,
    IDLE_TIMEOUT_MILLIS: process.env.DATABASE_IDLE_TIMEOUT_MILLIS || 500,
  },
  RABBITMQ: {
    BASE_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    VIRTUAL_HOST_NAME: process.env.RABBITMQ_VIRTUAL_HOST_NAME || '/',
    EXCHANGE_TYPE: process.env.RABBITMQ_EXCHANGE_TYPE || 'direct',
    EXCHANGE_NAME: process.env.RABBITMQ_EXCHANGE_NAME || 'buy-ticket',
    PREFETCH_COUNT: parseInt(process.env.RABBITMQ_PREFETCH_COUNT || '10', 10),
    CONNECTION_TIMEOUT: parseInt(process.env.RABBITMQ_CONNECTION_TIMEOUT || '30000', 10),
    QUEUES: {
      BUY_TICKET_QUEUE: process.env.RABBITMQ_BUY_TICKET_QUEUE || 'buy-ticket-queue',
      BUY_TICKET_FAIL_QUEUE: process.env.RABBITMQ_BUY_TICKET_FAIL_QUEUE || 'buy-ticket-fail-queue',
    },
  },
  REDIS: {
    URL: process.env.REDIS_URL,
    MAX_RETRIES_PER_REQUEST: parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST || '25', 50),
    CONNECTION_TIMEOUT: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '10000', 10),
    RETRY_DELAY: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
    ENABLE_READY_CHECK: Boolean(process.env.REDIS_ENABLE_READY_CHECK || false),
  },
};
