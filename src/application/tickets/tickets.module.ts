import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { MoviesModule } from '@application/movies/movies.module';
import { TicketsController } from '@api/tickets/tickets.controller';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import RabbitMQModule from '@infrastructure/rabbitmq/rabbitmq.module';
import { SessionsModule } from '@application/sessions/sessions.module';
import { TicketsConsumer } from '@application/tickets/tickets.consumer';
import { EmailModule } from '@infrastructure/notification/email/email.module';
import { TicketRepository } from '@infrastructure/repositories/ticket.repository';
import { WatchHistoryModule } from '@application/watch-history/watch-history.module';
import { TicketRepositoryToken } from '@domain/tickets/repositories/ticket-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity]), SessionsModule, MoviesModule, WatchHistoryModule, RabbitMQModule, EmailModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketsConsumer,
    {
      provide: TicketRepositoryToken,
      useClass: TicketRepository,
    },
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
