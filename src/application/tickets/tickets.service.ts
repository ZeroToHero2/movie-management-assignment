import { FindOneOptions } from 'typeorm';
import { Status } from '@application/common/enums';
import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { UserEntity } from '@domain/users/entities/user.entity';
import { WatchMovieDto } from '@api/tickets/dto/watch-movie.dto';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { SessionsService } from '@application/sessions/sessions.service';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';
import { RABBITMQ_QUEUES } from '@infrastructure/rabbitmq/rabbitmq.constants';
import { WatchHistoryService } from '@application/watch-history/watch-history.service';
import { ITicketRepository, TicketRepositoryToken } from '@domain/tickets/repositories/ticket-repository.interface';
import {
  MovieIsNotActiveError,
  TicketAlreadyUsedError,
  TicketNotFoundError,
  UserNotOldEnoughError,
  TicketDoesNotBelongToUserError,
  SessionAlreadyPassedError,
} from '@domain/exceptions';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(TicketRepositoryToken)
    private readonly ticketRepository: ITicketRepository,
    private readonly sessionsService: SessionsService,
    private readonly watchHistoryService: WatchHistoryService,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  @Transactional()
  async buyTicket(user: UserEntity, sessionId: string): Promise<TicketEntity> {
    const session = await this.sessionsService.getSession({
      where: { id: sessionId },
      relations: { movie: true },
    });

    this.isUserEligibleToBuyTicket(user, session);

    const newTicket = this.ticketRepository.create({ user, session });
    const savedTicket = await this.ticketRepository.save(newTicket);

    await this.rabbitmqService.publish(RABBITMQ_QUEUES.BUY_TICKET.ROUTING_KEY, {
      userId: user.id,
      ticketId: savedTicket.id,
    });

    return savedTicket;
  }

  @Transactional()
  async watchMovie(user: UserEntity, watchMovieDto: WatchMovieDto): Promise<TicketEntity> {
    const ticket = await this.getTicket({
      where: { id: watchMovieDto.ticketId },
      relations: { session: { movie: true }, user: true },
    });

    this.isUserEligibleToWatchMovie(user, ticket);

    ticket.used = true;

    const [savedTicket] = await Promise.all([
      this.ticketRepository.save(ticket),
      this.watchHistoryService.save(
        this.watchHistoryService.create({
          user,
          movie: ticket.session.movie,
          watchedAt: new Date(),
        }),
      ),
    ]);

    return savedTicket;
  }

  async getTicket(options: FindOneOptions<TicketEntity>): Promise<TicketEntity | null> {
    const ticket = await this.ticketRepository.findOneWithOptions(options);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    return ticket;
  }

  //? Business Logic Checks - START
  /**
   * Checks if a user is eligible to watch a movie based on their ticket.
   *
   * @param user - The user entity attempting to watch the movie.
   * @param ticket - The ticket entity associated with the movie session.
   * @throws TicketAlreadyUsedError - If the ticket has already been used.
   * @throws TicketDoesNotBelongToUserError - If the ticket does not belong to the user.
   * @throws SessionAlreadyPassedError - If the session has already passed.
   */
  public isUserEligibleToWatchMovie(user: UserEntity, ticket: TicketEntity) {
    if (ticket.used) {
      throw new TicketAlreadyUsedError();
    }

    if (ticket.user.id !== user.id) {
      throw new TicketDoesNotBelongToUserError();
    }

    this.checkIfSessionHasPassed(ticket.session.date, ticket.session.timeSlot);
  }

  /**
   * Checks if a user is eligible to buy a ticket for a movie session.
   *
   * @param user - The user entity attempting to buy the ticket.
   * @param session - The session entity associated with the movie.
   * @throws MovieIsNotActiveError - If the movie is not active.
   * @throws UserNotOldEnoughError - If the user is not old enough to watch the movie.
   * @throws SessionAlreadyPassedError - If the session has already passed.
   */
  private isUserEligibleToBuyTicket(user: UserEntity, session: SessionEntity) {
    if (session.movie.status === Status.INACTIVE) {
      throw new MovieIsNotActiveError();
    }

    if (user.age <= session.movie.ageRestriction) {
      throw new UserNotOldEnoughError();
    }

    this.checkIfSessionHasPassed(session.date, session.timeSlot);
  }

  /**
   * Checks if a session has already passed based on its date and time slot.
   *
   * @param sessionDate - The date of the session.
   * @param timeSlot - The time slot of the session.
   * @throws SessionAlreadyPassedError - If the session has already passed.
   */
  private checkIfSessionHasPassed(sessionDate: Date, timeSlot: TimeSlot) {
    const now = new Date();

    if (sessionDate < now) {
      throw new SessionAlreadyPassedError();
    }

    const [startHour, startMinute] = timeSlot.split('-')[0].split(':').map(Number);
    const sessionStartTime = new Date(sessionDate);
    sessionStartTime.setHours(startHour, startMinute, 0, 0);

    if (now > sessionStartTime) {
      throw new SessionAlreadyPassedError();
    }
  }
  //? Business Logic Checks - END
}
