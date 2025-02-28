import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryEntity } from '@domain/watch-history/entites/watch-history.entity';
import { WatchHistoryRepository } from '@infrastructure/repositories/watch-history.repository';
import { WatchHistoryRepositoryToken } from '@domain/watch-history/repositories/watch-history-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([WatchHistoryEntity])],
  providers: [
    {
      provide: WatchHistoryRepositoryToken,
      useClass: WatchHistoryRepository,
    },
    WatchHistoryService,
  ],
  controllers: [],
  exports: [WatchHistoryService],
})
export class WatchHistoryModule {}
