import { Injectable } from '@nestjs/common';
import { GetMoviesDto } from '@api/movies/dto';
import { Status } from '@application/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieNotFoundError } from '@domain/exceptions';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { IMovieRepository } from '@domain/movies/repositories/movie-repository.interface';
import { ComparisonSymbolsOperators } from '@application/common/enums/comparisan-symbols.enum';
import { DeepPartial, DeleteResult, FindManyOptions, FindOneOptions, ILike, Repository } from 'typeorm';

@Injectable()
export class MovieRepository implements IMovieRepository {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly repository: Repository<MovieEntity>,
  ) {}

  create(movie: DeepPartial<MovieEntity>): MovieEntity {
    return this.repository.create(movie);
  }

  async save(movie: DeepPartial<MovieEntity>): Promise<MovieEntity> {
    return this.repository.save(movie);
  }

  async findOneById(id: string): Promise<MovieEntity | null> {
    const options: FindOneOptions<MovieEntity> = { where: { id } };
    return this.repository.findOne(options);
  }

  async updateOne(id: string, partialMovie: DeepPartial<MovieEntity>): Promise<MovieEntity> {
    const movie = await this.repository.findOne({ where: { id } });
    if (!movie) {
      throw new MovieNotFoundError();
    }
    return this.repository.save({ ...movie, ...partialMovie });
  }

  async softDeleteById(id: string): Promise<MovieEntity> {
    const movie = await this.repository.findOne({ where: { id, status: Status.ACTIVE }, relations: { sessions: true } });
    if (!movie) {
      throw new MovieNotFoundError();
    }
    await this.repository.update(id, { status: Status.INACTIVE });
    return movie;
  }

  async deleteById(id: string): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  async findOneWithOptions(relations: FindOneOptions<MovieEntity>): Promise<MovieEntity | null> {
    return this.repository.findOne(relations);
  }

  async getActiveMovies(getMoviesDto: GetMoviesDto): Promise<MovieEntity[]> {
    const filter: Record<string, any> = {};

    const { name, ageRestriction, ageRestrictionComparisonSymbol, sortBy, sortOrder } = getMoviesDto;

    if (name) {
      Object.assign(filter, { name: ILike(`%${name}%`) });
    }

    if (ageRestriction) {
      const operator = ComparisonSymbolsOperators[ageRestrictionComparisonSymbol];
      Object.assign(filter, { ageRestriction: operator(ageRestriction) });
    }

    const options: FindManyOptions<MovieEntity> = {
      relations: { sessions: true },
      order: { [sortBy]: sortOrder },
      where: { ...filter, status: Status.ACTIVE },
    };

    return this.repository.find(options);
  }
}
