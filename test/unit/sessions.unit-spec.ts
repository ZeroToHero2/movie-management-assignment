import { DeleteResult } from 'typeorm';
import { Status } from '@application/common/enums';
import { Test, TestingModule } from '@nestjs/testing';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { TimeSlot } from '../../src/domain/sessions/enums/time.slot.enum';
import { SessionsService } from '../../src/application/sessions/sessions.service';
import { ISessionRepository, SessionRepositoryToken } from '@domain/sessions/repositories/session-repository.interface';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionRepository: ISessionRepository;

  const mockMovieId = 'movie-1';
  const mockSessionId = '4a7962f8-18f2-4c43-bbf3-34c1e5147c66';

  const mockSession: SessionEntity = {
    id: mockSessionId,
    date: new Date('2024-01-01'),
    timeSlot: '10:00-12:00' as TimeSlot,
    roomNumber: 1,
    movie: {
      id: mockMovieId,
      name: 'Test Movie',
      ageRestriction: 13,
      status: Status.ACTIVE,
    } as MovieEntity,
  } as SessionEntity;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: SessionRepositoryToken,
          useValue: {
            save: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
            findOneByOptions: jest.fn(),
            findOneById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    sessionRepository = module.get<ISessionRepository>(SessionRepositoryToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete operations', () => {
    describe('deleteSession', () => {
      it('should successfully delete a session and return true', async () => {
        jest.spyOn(sessionRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

        const result = await service.deleteSession(mockSessionId);

        expect(result).toEqual({ result: true });
        expect(sessionRepository.delete).toHaveBeenCalledWith(mockSessionId);
      });

      it('should throw error when session not found', async () => {
        jest.spyOn(sessionRepository, 'delete').mockResolvedValue({ affected: 0 } as DeleteResult);

        await expect(service.deleteSession(mockSessionId)).rejects.toThrow('Session not found');
      });
    });

    describe('deleteAllSessions', () => {
      it('should successfully delete all sessions for a movie', async () => {
        jest.spyOn(sessionRepository, 'delete').mockResolvedValue({ affected: 5 } as DeleteResult);

        const result = await service.deleteAllSessions(mockMovieId);

        expect(result).toEqual({ result: true });
        expect(sessionRepository.delete).toHaveBeenCalledWith({
          movie: { id: mockMovieId },
        });
      });

      it('should throw error when no sessions found for movie', async () => {
        jest.spyOn(sessionRepository, 'delete').mockResolvedValue({ affected: 0 } as DeleteResult);

        await expect(service.deleteAllSessions(mockMovieId)).rejects.toThrow('Movie has no sessions to delete');
      });

      it('should propagate database errors', async () => {
        jest.spyOn(sessionRepository, 'delete').mockRejectedValue(new Error('Database error'));

        await expect(service.deleteAllSessions(mockMovieId)).rejects.toThrow('Database error');
      });
    });
  });

  describe('query operations', () => {
    describe('getSession', () => {
      it('should find a session with all relations', async () => {
        jest.spyOn(sessionRepository, 'findOneByOptions').mockResolvedValue(mockSession);

        const result = await service.getSession({
          where: { id: mockSessionId },
          relations: ['movie'],
        });

        expect(result).toEqual(mockSession);
        expect(result.movie).toBeDefined();
        expect(sessionRepository.findOneByOptions).toHaveBeenCalledWith({
          where: { id: mockSessionId },
          relations: ['movie'],
        });
      });

      it('should throw error when session not found', async () => {
        jest.spyOn(sessionRepository, 'findOneByOptions').mockResolvedValue(null);

        await expect(
          service.getSession({
            where: { id: mockSessionId },
          }),
        ).rejects.toThrow('Session not found');
      });

      it('should propagate database errors', async () => {
        jest.spyOn(sessionRepository, 'findOneByOptions').mockRejectedValue(new Error('Database error'));

        await expect(
          service.getSession({
            where: { id: mockSessionId },
          }),
        ).rejects.toThrow('Database error');
      });
    });
  });
});
