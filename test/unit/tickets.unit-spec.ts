import { Status } from '@application/common/enums';
import { Role } from '@domain/auth/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@domain/users/entities/user.entity';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { TimeSlot } from '../../src/domain/sessions/enums/time.slot.enum';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';
import { TicketsService } from '../../src/application/tickets/tickets.service';
import { SessionsService } from '../../src/application/sessions/sessions.service';
import { WatchHistoryService } from '@application/watch-history/watch-history.service';
import { ITicketRepository, TicketRepositoryToken } from '../../src/domain/tickets/repositories/ticket-repository.interface';
import { MovieIsNotActiveError, UserNotOldEnoughError, TicketAlreadyUsedError, TicketNotFoundError } from '../../src/domain/exceptions';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('TicketsService', () => {
  let ticketsService: TicketsService;
  let sessionsService: SessionsService;
  let ticketRepository: ITicketRepository;
  let rabbitmqService: RabbitMQService;

  // Test fixtures
  const mockUser: UserEntity = {
    id: '4a736f64-616c-69-6173-696f6e',
    age: 20,
    email: 'user@example.com',
    role: Role.CUSTOMER,
  } as UserEntity;

  const mockSession: SessionEntity = {
    id: 'session-id',
    date: new Date(Date.now() + 86400000),
    timeSlot: '10:00-12:00' as TimeSlot,
    movie: { id: 'movie-id', isActive: true, ageRestriction: 18 } as any,
  } as SessionEntity;

  const mockTicket: TicketEntity = {
    id: '4a736f64-616c-69-6173-696f6e',
    user: mockUser,
    used: false,
    session: mockSession,
  } as TicketEntity;

  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TicketRepositoryToken,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneById: jest.fn(),
            findOneWithOptions: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            getSession: jest.fn(),
            addSessionToMovie: jest.fn(),
            updateSession: jest.fn(),
            deleteSession: jest.fn(),
          },
        },
        {
          provide: WatchHistoryService,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            getWatchHistory: jest.fn(),
          },
        },

        {
          provide: RabbitMQService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    ticketsService = module.get<TicketsService>(TicketsService);
    rabbitmqService = module.get<RabbitMQService>(RabbitMQService);
    sessionsService = module.get<SessionsService>(SessionsService);
    ticketRepository = module.get<ITicketRepository>(TicketRepositoryToken);
  });

  it('should be defined', () => {
    expect(ticketsService).toBeDefined();
  });

  describe('buyTicket', () => {
    beforeEach(() => {
      jest.spyOn(sessionsService, 'getSession').mockResolvedValue(mockSession);
      jest.spyOn(ticketRepository, 'create').mockReturnValue(mockTicket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue(mockTicket);
      jest.spyOn(rabbitmqService, 'publish').mockResolvedValue(true);
    });

    it('should successfully create a ticket for eligible user', async () => {
      const result = await ticketsService.buyTicket(mockUser, mockSession.id);

      expect(result).toBeDefined();
      expect(ticketRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        session: mockSession,
      });
      expect(ticketRepository.save).toHaveBeenCalled();
      expect(rabbitmqService.publish).toHaveBeenCalled();
    });

    it('should throw MovieIsNotActiveError for inactive movie', async () => {
      const inactiveSession = { ...mockSession, movie: { ...mockSession.movie, status: Status.INACTIVE } };
      jest.spyOn(sessionsService, 'getSession').mockResolvedValue(inactiveSession);

      await expect(ticketsService.buyTicket(mockUser, mockSession.id)).rejects.toThrow(MovieIsNotActiveError);
    });

    it('should throw UserNotOldEnoughError for underage user', async () => {
      const underageUser = { ...mockUser, age: 16 };

      await expect(ticketsService.buyTicket(underageUser, mockSession.id)).rejects.toThrow(UserNotOldEnoughError);
    });
  });

  describe('watchMovie', () => {
    beforeEach(() => {
      jest.spyOn(ticketRepository, 'findOneWithOptions').mockResolvedValue(mockTicket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue({ ...mockTicket, used: true });
      jest.spyOn(sessionsService, 'getSession').mockResolvedValue(mockSession);
    });

    it('should successfully mark ticket as used', async () => {
      const result = await ticketsService.watchMovie(mockUser, { ticketId: mockTicket.id });

      expect(result.used).toBe(true);
      expect(ticketRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockTicket.id,
          used: true,
        }),
      );
    });

    it('should throw TicketAlreadyUsedError for used ticket', async () => {
      const usedTicket = { ...mockTicket, used: true };
      jest.spyOn(ticketRepository, 'findOneWithOptions').mockResolvedValue(usedTicket);

      await expect(ticketsService.watchMovie(mockUser, { ticketId: mockTicket.id })).rejects.toThrow(TicketAlreadyUsedError);
    });

    it('should throw TicketNotFoundError for non-existent ticket', async () => {
      jest.spyOn(ticketRepository, 'findOneWithOptions').mockResolvedValue(null);

      await expect(ticketsService.watchMovie(mockUser, { ticketId: 'non-existent' })).rejects.toThrow(TicketNotFoundError);
    });
  });
});
