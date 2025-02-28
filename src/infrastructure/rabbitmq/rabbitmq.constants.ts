const RABBITMQ_INJECTION_TOKEN = 'RABBITMQ_SERVICE';

const RABBITMQ_QUEUES = {
  BUY_TICKET: {
    NAME: 'buy-ticket-queue',
    ROUTING_KEY: 'buy-ticket',
    RETRY_COUNT: 5,
  },
  BUY_TICKET_FAIL: {
    NAME: 'buy-ticket-fail-queue',
    ROUTING_KEY: 'buy-ticket-fail',
    RETRY_COUNT: 5,
  },
};

export { RABBITMQ_QUEUES, RABBITMQ_INJECTION_TOKEN };
