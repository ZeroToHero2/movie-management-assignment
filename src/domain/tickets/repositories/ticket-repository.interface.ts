import { TicketEntity } from '../entities/ticket.entity';
import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';

export const TicketRepositoryToken = Symbol('ITicketRepository');

export interface ITicketRepository {
  create(ticket: DeepPartial<TicketEntity>): TicketEntity;
  save(ticket: TicketEntity): Promise<TicketEntity>;
  find(options: FindManyOptions<TicketEntity>): Promise<TicketEntity[]>;
  findOneWithOptions(options: FindOneOptions<TicketEntity>): Promise<TicketEntity | null>;
}
