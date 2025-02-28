import { GetMoviesDto } from '@api/movies/dto';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { DeepPartial, DeleteResult, FindOneOptions } from 'typeorm';

export const MovieRepositoryToken = Symbol('IMovieRepository');

export interface IMovieRepository {
  create(movie: DeepPartial<MovieEntity>): MovieEntity;
  save(movie: DeepPartial<MovieEntity>): Promise<MovieEntity>;
  findOneById(id: string): Promise<MovieEntity | null>;
  updateOne(id: string, partialMovie: DeepPartial<MovieEntity>): Promise<MovieEntity>;
  softDeleteById(id: string): Promise<MovieEntity>;
  deleteById(id: string): Promise<DeleteResult>;
  findOneWithOptions(options: FindOneOptions<MovieEntity>): Promise<MovieEntity | null>;
  getActiveMovies(getMoviesDto: GetMoviesDto): Promise<MovieEntity[]>;
}
