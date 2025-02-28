import { DeepPartial, DeleteResult, FindOneOptions } from 'typeorm';
import { SessionEntity } from '@domain/sessions/entities/session.entity';

export const SessionRepositoryToken = Symbol('ISessionRepository');

export interface ISessionRepository {
  create(session: DeepPartial<SessionEntity>): SessionEntity;
  save(session: SessionEntity): Promise<SessionEntity>;
  findOne(id: string, options?: any): Promise<SessionEntity | null>;
  findOneByOptions(options: FindOneOptions<SessionEntity>): Promise<SessionEntity | null>;
  findByOptions(options: FindOneOptions<SessionEntity>): Promise<SessionEntity[]>;
  updateOne(id: string, partialSession: Partial<SessionEntity>): Promise<SessionEntity>;
  delete(options?: any): Promise<DeleteResult>;
}
