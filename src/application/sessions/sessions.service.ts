import { FindOneOptions } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { CreateSessionDto, UpdateSessionDto } from '@api/sessions/dto';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { MovieHasNoSessionsToDelete, SessionAlreadyExistsError, SessionNotFoundError } from '@domain/exceptions';
import { ISessionRepository, SessionRepositoryToken } from '@domain/sessions/repositories/session-repository.interface';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(SessionRepositoryToken)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async getSession(options: FindOneOptions<SessionEntity>): Promise<SessionEntity | null> {
    const session = await this.sessionRepository.findOneByOptions(options);

    if (!session) {
      throw new SessionNotFoundError();
    }

    return session;
  }

  @Transactional()
  async addSessionToMovie(movieId: string, createSessionDto: CreateSessionDto): Promise<SessionEntity> {
    await this.checkIfRoomIsAvailable(createSessionDto);
    const session = this.sessionRepository.create({ ...createSessionDto, movie: { id: movieId } });
    return this.sessionRepository.save(session);
  }

  async updateSession(sessionId: string, updateSessionDto: UpdateSessionDto): Promise<SessionEntity> {
    const session = await this.sessionRepository.findOneByOptions({ where: { id: sessionId } });
    await this.checkIfRoomIsAvailable(updateSessionDto);
    Object.assign(session, updateSessionDto);
    return this.sessionRepository.save(session);
  }

  async deleteSession(id: string): Promise<{ result: boolean }> {
    const result = await this.sessionRepository.delete(id);

    if (result.affected > 0) {
      return { result: true };
    } else {
      throw new SessionNotFoundError();
    }
  }

  async deleteAllSessions(movieId: string): Promise<{ result: boolean }> {
    const result = await this.sessionRepository.delete({ movie: { id: movieId } });

    if (result.affected > 0) {
      return { result: true };
    } else {
      throw new MovieHasNoSessionsToDelete();
    }
  }

  @Transactional()
  async checkIfRoomIsAvailable(sessionParams: { date: Date; timeSlot: TimeSlot; roomNumber: number }): Promise<void> {
    const { date, timeSlot, roomNumber } = sessionParams;

    const existingSession = await this.sessionRepository.findOneByOptions({
      where: {
        date: date,
        timeSlot: timeSlot,
        roomNumber: roomNumber,
      },
    });

    if (existingSession) {
      throw new SessionAlreadyExistsError();
    }
  }
}
