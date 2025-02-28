import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { WatchHistoryEntity } from '@domain/watch-history/entites/watch-history.entity';

export const WatchHistoryRepositoryToken = Symbol('IWatchHistoryRepository');

export interface IWatchHistoryRepository {
  create(watchHistory: DeepPartial<WatchHistoryEntity>): WatchHistoryEntity;
  save(watchHistory: WatchHistoryEntity): Promise<WatchHistoryEntity>;
  findOne(options: FindOneOptions<WatchHistoryEntity>): Promise<WatchHistoryEntity | null>;
  find(options: FindManyOptions<WatchHistoryEntity>): Promise<WatchHistoryEntity[]>;
}
