import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { WatchHistoryEntity } from '@domain/watch-history/entites/watch-history.entity';
import { IWatchHistoryRepository } from '@domain/watch-history/repositories/watch-history-repository.interface';

@Injectable()
export class WatchHistoryRepository implements IWatchHistoryRepository {
  constructor(
    @InjectRepository(WatchHistoryEntity)
    private readonly repository: Repository<WatchHistoryEntity>,
  ) {}

  create(watchHistory: DeepPartial<WatchHistoryEntity>): WatchHistoryEntity {
    return this.repository.create(watchHistory);
  }

  async save(watchHistory: WatchHistoryEntity): Promise<WatchHistoryEntity> {
    return this.repository.save(watchHistory);
  }

  async find(options: FindManyOptions<WatchHistoryEntity>): Promise<WatchHistoryEntity[]> {
    return this.repository.find(options);
  }

  async findOne(options: FindOneOptions<WatchHistoryEntity>): Promise<WatchHistoryEntity | null> {
    return this.repository.findOne(options);
  }
}
