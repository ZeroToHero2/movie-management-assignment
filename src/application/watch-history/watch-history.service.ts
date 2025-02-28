import { DeepPartial } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { WatchHistoryEntity } from '@domain/watch-history/entites/watch-history.entity';
import {
  IWatchHistoryRepository,
  WatchHistoryRepositoryToken,
} from '@domain/watch-history/repositories/watch-history-repository.interface';

@Injectable()
export class WatchHistoryService {
  constructor(
    @Inject(WatchHistoryRepositoryToken)
    private readonly watchHistoryRepository: IWatchHistoryRepository,
  ) {}

  create(watchHistory: DeepPartial<WatchHistoryEntity>): WatchHistoryEntity {
    return this.watchHistoryRepository.create(watchHistory);
  }

  async save(watchHistory: WatchHistoryEntity): Promise<WatchHistoryEntity> {
    return this.watchHistoryRepository.save(watchHistory);
  }

  async getWatchHistory(userId: string): Promise<WatchHistoryEntity[]> {
    return this.watchHistoryRepository.find({
      where: { user: { id: userId } },
      relations: {
        movie: true,
      },
    });
  }
}
