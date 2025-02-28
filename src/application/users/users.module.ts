import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from '@api/users/users.controller';
import { UserEntity } from '@domain/users/entities/user.entity';
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { WatchHistoryModule } from '@application/watch-history/watch-history.module';
import { UserRepositoryToken } from '@domain/users/repositories/user-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), WatchHistoryModule],
  providers: [
    {
      provide: UserRepositoryToken,
      useClass: UserRepository,
    },

    UsersService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
