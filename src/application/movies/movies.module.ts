import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { MoviesController } from '@api/movies/movies.controller';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { SessionsModule } from '@application/sessions/sessions.module';
import { MovieRepository } from '@infrastructure/repositories/movie.repository';
import { MovieRepositoryToken } from '@domain/movies/repositories/movie-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity]), SessionsModule],
  controllers: [MoviesController],
  providers: [
    MoviesService,
    {
      provide: MovieRepositoryToken,
      useClass: MovieRepository,
    },
  ],
  exports: [MoviesService],
})
export class MoviesModule {}
