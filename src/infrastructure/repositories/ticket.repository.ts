import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ITicketRepository } from '@domain/tickets/repositories/ticket-repository.interface';

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly repository: Repository<TicketEntity>,
  ) {}

  create(ticket: DeepPartial<TicketEntity>): TicketEntity {
    return this.repository.create(ticket);
  }

  async save(ticket: TicketEntity): Promise<TicketEntity> {
    return this.repository.save(ticket);
  }

  async find(options: FindManyOptions<TicketEntity>): Promise<TicketEntity[]> {
    return this.repository.find(options);
  }

  async findOneWithOptions(options: FindOneOptions<TicketEntity>): Promise<TicketEntity | null> {
    return this.repository.findOne(options);
  }
}
