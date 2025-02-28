import { FindOneOptions } from 'typeorm';
import { Status } from '@application/common/enums';
import { Injectable, Inject } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { SessionsService } from '@application/sessions/sessions.service';
import { MovieAlreadyExistsError, MovieNotFoundError } from '@domain/exceptions';
import { IMovieRepository, MovieRepositoryToken } from '@domain/movies/repositories/movie-repository.interface';
import { BulkCreateMovieDto, BulkDeleteMovieDto, GetMoviesDto, CreateMovieDto, UpdateMovieDto } from '@api/movies/dto';

@Injectable()
export class MoviesService {
  constructor(
    @Inject(MovieRepositoryToken)
    private readonly movieRepository: IMovieRepository,
    private readonly sessionsService: SessionsService,
  ) {}

  async getActiveMovies(getMoviesDto: GetMoviesDto): Promise<MovieEntity[]> {
    return this.movieRepository.getActiveMovies(getMoviesDto);
  }

  async getMovieWithSessions(id: string, status: Status): Promise<MovieEntity> {
    return this.findOne({
      where: { id, status },
      relations: {
        sessions: true,
      },
    });
  }

  @Transactional()
  async createMovie(createMovieDto: CreateMovieDto): Promise<MovieEntity> {
    const { name, ageRestriction, sessions } = createMovieDto;
    const movie = await this.movieRepository.findOneWithOptions({ where: { name } });
    if (movie) {
      throw new MovieAlreadyExistsError();
    }

    const savedMovie = await this.movieRepository.save(
      this.movieRepository.create({
        name,
        ageRestriction,
      }),
    );

    if (sessions && sessions.length > 0) {
      await Promise.all(sessions.map((sessionDto) => this.sessionsService.addSessionToMovie(savedMovie.id, sessionDto)));
    }

    return this.findOne({ where: { id: savedMovie.id }, relations: { sessions: true } });
  }

  @Transactional()
  async updateMovie(id: string, updateMovieDto: UpdateMovieDto): Promise<MovieEntity> {
    const { sessions, ...movieDto } = updateMovieDto;
    const movie = await this.findOne({ where: { id, status: Status.ACTIVE } });

    Object.assign(movie, movieDto);
    const updatedMovie = await this.movieRepository.save(movie);

    if (sessions && sessions.length > 0) {
      await Promise.all([sessions.map((sessionDto) => this.sessionsService.addSessionToMovie(updatedMovie.id, sessionDto))]);
    }

    return this.findOne({ where: { id }, relations: { sessions: true } });
  }

  @Transactional()
  async softDeleteMovie(id: string): Promise<MovieEntity> {
    const result = await this.movieRepository.softDeleteById(id);

    if (result?.sessions && result?.sessions?.length > 0) {
      await this.sessionsService.deleteAllSessions(id);
    }
    return result;
  }

  @Transactional()
  async bulkAddMovies(bulkCreateMovieDto: BulkCreateMovieDto): Promise<MovieEntity[]> {
    const movies: MovieEntity[] = [];

    const moviePromises = bulkCreateMovieDto.movies.map(async (createMovieDto) => {
      const { name, ageRestriction, sessions } = createMovieDto;

      const movie = await this.movieRepository.findOneWithOptions({ where: { name } });
      if (movie) {
        throw new MovieAlreadyExistsError();
      }

      const movieEntity = this.movieRepository.create({
        name,
        ageRestriction,
      });

      const savedMovie = await this.movieRepository.save(movieEntity);

      if (sessions && sessions.length > 0) {
        await Promise.all(sessions.map(async (sessionDto) => this.sessionsService.addSessionToMovie(savedMovie.id, sessionDto)));
      }

      movies.push(savedMovie);
    });

    await Promise.all(moviePromises);
    return movies;
  }

  @Transactional()
  async bulkDeleteMovies(bulkDeleteMovieDto: BulkDeleteMovieDto): Promise<MovieEntity[]> {
    const { movieIds } = bulkDeleteMovieDto;
    const deletedMovies: MovieEntity[] = [];

    await Promise.all(
      movieIds.map(async (id) => {
        const movie = await this.findOne({
          where: { id },
          relations: {
            sessions: true,
          },
        });

        if (movie) {
          if (movie.sessions && movie.sessions.length > 0) {
            await this.sessionsService.deleteAllSessions(movie.id);
          }
          await this.movieRepository.updateOne(id, { status: Status.INACTIVE });
          deletedMovies.push(movie);
        }
      }),
    );

    return deletedMovies;
  }

  private async findOne(options: FindOneOptions<MovieEntity>): Promise<MovieEntity> {
    const movie = await this.movieRepository.findOneWithOptions(options);

    if (!movie) {
      throw new MovieNotFoundError();
    }

    return movie;
  }
}
