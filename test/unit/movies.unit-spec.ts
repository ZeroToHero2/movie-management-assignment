/* eslint-disable @typescript-eslint/no-require-imports */
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Sort, Status } from '@application/common/enums';
import { GetMoviesDto } from '@api/movies/dto/get-movies.dto';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { CreateMovieDto } from '@api/movies/dto/create-movie.dto';
import { UpdateMovieDto } from '@api/movies/dto/update-movie.dto';
import { MoviesService } from '@application/movies/movies.service';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { CreateSessionDto } from '@api/sessions/dto/create-session.dto';
import { SessionsService } from '@application/sessions/sessions.service';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { BulkCreateMovieDto } from '@api/movies/dto/bulk/bulk-create-movie.dto';
import { MovieNotFoundError, SessionAlreadyExistsError } from '@domain/exceptions';
import { ComparisonSymbols } from '@application/common/enums/comparisan-symbols.enum';
import { MovieRepositoryToken } from '@domain/movies/repositories/movie-repository.interface';
import { SessionRepositoryToken } from '@domain/sessions/repositories/session-repository.interface';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('MoviesService', () => {
  let service: MoviesService;
  let sessionService: SessionsService;
  let mockMovieRepository: any;
  let mockSessionRepository: any;
  let mockLogger: any;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    mockMovieRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneById: jest.fn(),
      updateOne: jest.fn(),
      softDeleteById: jest.fn(),
      deleteById: jest.fn(),
      findOneWithOptions: jest.fn(),
      getActiveMovies: jest.fn(),
    };

    mockSessionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneByOptions: jest.fn(),
      findOne: jest.fn(),
    };

    mockLogger = {
      setContext: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        SessionsService,
        { provide: MovieRepositoryToken, useValue: mockMovieRepository },
        { provide: SessionRepositoryToken, useValue: mockSessionRepository },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    sessionService = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMovie', () => {
    it('should create a movie with sessions', async () => {
      const createMovieDto: CreateMovieDto = {
        name: 'New Movie',
        ageRestriction: 12,
        sessions: [{ date: new Date('2022-02-02'), timeSlot: TimeSlot.SLOT_10_12, roomNumber: 1 }],
      };

      const savedMovie = { id: '1', ...createMovieDto };
      const savedSession = { id: '1', ...createMovieDto.sessions[0], movie: savedMovie };

      mockMovieRepository.findOneWithOptions.mockImplementation(() => {
        // Return null first time, savedMovie second time
        if (mockMovieRepository.findOneWithOptions.mock.calls.length > 1) {
          return Promise.resolve(savedMovie);
        }
        return Promise.resolve(null);
      });

      mockMovieRepository.create.mockReturnValue(savedMovie);
      mockMovieRepository.save.mockResolvedValue(savedMovie);
      mockSessionRepository.create.mockReturnValue(savedSession);
      mockSessionRepository.save.mockResolvedValue(savedSession);
      mockSessionRepository.findOneByOptions.mockResolvedValue(null);

      const result = await service.createMovie(createMovieDto);

      expect(result).toEqual({
        ...savedMovie,
        sessions: [
          {
            date: createMovieDto.sessions[0].date,
            timeSlot: createMovieDto.sessions[0].timeSlot,
            roomNumber: createMovieDto.sessions[0].roomNumber,
          },
        ],
      });
      expect(mockMovieRepository.create).toHaveBeenCalled();
      expect(mockMovieRepository.save).toHaveBeenCalled();
      expect(mockSessionRepository.create).toHaveBeenCalled();
      expect(mockSessionRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateMovie', () => {
    it('should update a movie', async () => {
      const movieId = '1';
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
        sessions: [],
      };

      const existingMovie = new MovieEntity();
      existingMovie.name = 'Old Movie';
      existingMovie.ageRestriction = 12;
      existingMovie.id = movieId;

      mockMovieRepository.findOneById.mockResolvedValue(existingMovie);
      mockMovieRepository.save.mockResolvedValue({ ...existingMovie, ...updateMovieDto });
      mockMovieRepository.findOneWithOptions.mockResolvedValue({ ...existingMovie, ...updateMovieDto, sessions: [] });

      const result = await service.updateMovie(movieId, updateMovieDto);

      expect(result).toEqual({ ...existingMovie, ...updateMovieDto, sessions: [] });
      expect(mockMovieRepository.save).toHaveBeenCalled();
    });

    it('should throw MovieNotFoundError if movie does not exist', async () => {
      const movieId = '1';
      const updateMovieDto: UpdateMovieDto = {
        name: 'Updated Movie',
        ageRestriction: 16,
        sessions: [],
      };

      mockMovieRepository.findOneById.mockResolvedValue(null);

      await expect(service.updateMovie(movieId, updateMovieDto)).rejects.toThrow(MovieNotFoundError);
    });
  });

  describe('deleteMovie', () => {
    it('should mark a movie as inactive', async () => {
      const movieId = '1';
      const deletedMovie = { id: movieId, isActive: false };

      mockMovieRepository.softDeleteById.mockResolvedValue(deletedMovie);

      const result = await service.softDeleteMovie(movieId);

      expect(result).toEqual(deletedMovie);
      expect(mockMovieRepository.softDeleteById).toHaveBeenCalledWith(movieId);
    });
  });

  describe('addSessionToMovie', () => {
    it('should add a session to a movie', async () => {
      const movie = new MovieEntity();
      movie.name = 'Test Movie';
      movie.ageRestriction = 12;
      movie.id = '1';
      const createSessionDto: CreateSessionDto = {
        date: new Date('2023-05-01'),
        timeSlot: TimeSlot.SLOT_10_12,
        roomNumber: 1,
      };
      const expectedSession = new SessionEntity();
      expectedSession.date = new Date('2023-05-01');
      expectedSession.timeSlot = TimeSlot.SLOT_10_12;
      expectedSession.roomNumber = 1;
      expectedSession.movie = movie;
      expectedSession.id = '1';

      mockSessionRepository.findOneByOptions.mockResolvedValue(null);
      mockSessionRepository.save.mockResolvedValue(expectedSession);

      const result = await sessionService.addSessionToMovie(movie.id, createSessionDto);

      expect(result).toEqual(expectedSession);
      expect(mockSessionRepository.findOneByOptions).toHaveBeenCalled();
      expect(mockSessionRepository.save).toHaveBeenCalled();
    });

    it('should throw SessionAlreadyExistsError if session already exists', async () => {
      const movie = new MovieEntity();
      movie.name = 'Test Movie';
      movie.ageRestriction = 12;
      movie.id = '1';
      const createSessionDto: CreateSessionDto = {
        date: new Date('2023-05-01'),
        timeSlot: TimeSlot.SLOT_10_12,
        roomNumber: 1,
      };

      const existingSession = new SessionEntity();
      existingSession.date = new Date('2023-05-01');
      existingSession.timeSlot = TimeSlot.SLOT_10_12;
      existingSession.roomNumber = 1;
      existingSession.movie = movie;
      existingSession.id = '1';
      mockSessionRepository.findOneByOptions.mockResolvedValue(existingSession);

      await expect(sessionService.addSessionToMovie(movie.id, createSessionDto)).rejects.toThrow(SessionAlreadyExistsError);
    });
  });

  describe('getMovieWithSessions', () => {
    it('should return a movie with its sessions', async () => {
      const movieId = '1';
      const movie = new MovieEntity();
      movie.name = 'Test Movie';
      movie.ageRestriction = 12;
      movie.id = movieId;

      const session = new SessionEntity();
      session.date = new Date('2023-05-01');
      session.timeSlot = TimeSlot.SLOT_10_12;
      session.roomNumber = 1;
      session.movie = movie;
      session.id = '1';
      movie.sessions = [session];

      mockMovieRepository.findOneWithOptions.mockResolvedValue(movie);

      const result = await service.getMovieWithSessions(movieId, Status.ACTIVE);

      expect(result).toEqual(movie);
      expect(mockMovieRepository.findOneWithOptions).toHaveBeenCalledWith({
        where: { id: movieId, status: Status.ACTIVE },
        relations: { sessions: true },
      });
    });

    it('should throw MovieNotFoundError if movie does not exist', async () => {
      const movieId = '1';

      mockMovieRepository.findOneWithOptions.mockResolvedValue(null);

      await expect(service.getMovieWithSessions(movieId, Status.ACTIVE)).rejects.toThrow(MovieNotFoundError);
    });
  });

  describe('listActiveMovies', () => {
    it('should return a list of active movies', async () => {
      const listMoviesDto: GetMoviesDto = {
        sortBy: 'name',
        sortOrder: Sort.ASC,
        name: 'Test',
        ageRestriction: 12,
        ageRestrictionComparisonSymbol: ComparisonSymbols.GREATER_THAN_OR_EQUAL,
      };
      const movie1 = new MovieEntity();
      movie1.name = 'Test Movie 1';
      movie1.ageRestriction = 14;
      const movie2 = new MovieEntity();
      movie2.name = 'Test Movie 2';
      movie2.ageRestriction = 16;
      const expectedMovies = [movie1, movie2];

      // Ensure mockMovieRepository.findActiveMovies is properly mocked
      if (mockMovieRepository.getActiveMovies) {
        mockMovieRepository.getActiveMovies.mockResolvedValue(expectedMovies);
      } else {
        mockMovieRepository.getActiveMovies.mockResolvedValue(expectedMovies);
      }

      const result = await service.getActiveMovies(listMoviesDto);

      expect(result).toEqual(expectedMovies);
      expect(mockMovieRepository.getActiveMovies).toHaveBeenCalledWith({
        ageRestriction: listMoviesDto.ageRestriction,
        ageRestrictionComparisonSymbol: listMoviesDto.ageRestrictionComparisonSymbol,
        name: listMoviesDto.name,
        sortBy: listMoviesDto.sortBy,
        sortOrder: listMoviesDto.sortOrder,
      });
    });
  });

  describe('bulkAddMovies', () => {
    it('should add multiple movies in a transaction', async () => {
      const bulkCreateMovieDto: BulkCreateMovieDto = {
        movies: [
          { name: 'Movie 1', ageRestriction: 12, sessions: [] },
          { name: 'Movie 2', ageRestriction: 16, sessions: [] },
        ],
      };
      const movie1 = new MovieEntity();
      movie1.name = 'Movie 1';
      movie1.ageRestriction = 12;
      const movie2 = new MovieEntity();
      movie2.name = 'Movie 2';
      movie2.ageRestriction = 16;
      const expectedMovies = [movie2, movie1];

      // Fix: directly mock the save method to return the expected movies
      mockMovieRepository.save.mockResolvedValue(expectedMovies);

      const result = await service.bulkAddMovies(bulkCreateMovieDto);

      expect(result[0]).toEqual(expectedMovies);
      expect(mockMovieRepository.save).toHaveBeenCalled();
    });
  });
});
