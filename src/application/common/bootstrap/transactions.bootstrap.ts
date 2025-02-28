import { initializeTransactionalContext } from 'typeorm-transactional';

export const BootstrapTransactions = () => {
  initializeTransactionalContext();
};
