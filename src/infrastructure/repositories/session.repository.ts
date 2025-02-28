import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial, DeleteResult, FindOneOptions, Repository } from 'typeorm';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { ISessionRepository } from '@domain/sessions/repositories/session-repository.interface';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repository: Repository<SessionEntity>,
  ) {}

  create(session: DeepPartial<SessionEntity>): SessionEntity {
    return this.repository.create(session);
  }

  async save(session: SessionEntity): Promise<SessionEntity> {
    return this.repository.save(session);
  }

  async findOne(id: string, options?: any): Promise<SessionEntity | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  async findOneByOptions(options: FindOneOptions<SessionEntity>): Promise<SessionEntity | null> {
    return this.repository.findOne(options);
  }

  async findByOptions(options: FindOneOptions<SessionEntity>): Promise<SessionEntity[]> {
    return this.repository.find(options);
  }

  async updateOne(id: string, partialSession: Partial<SessionEntity>): Promise<SessionEntity> {
    const session = await this.repository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return this.repository.save({ ...session, ...partialSession });
  }

  async delete(options?: any): Promise<DeleteResult> {
    return this.repository.delete(options);
  }
}
