import { ConfigService } from '@nestjs/config';
import { TicketsService } from './tickets.service';
import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';
import { RABBITMQ_QUEUES } from '@infrastructure/rabbitmq/rabbitmq.constants';
import { RabbitSubscriber } from '@infrastructure/rabbitmq/rabbitmq.decorator';
import { EmailService } from '@infrastructure/notification/email/email.service';
import generateBuyTicketEmailTemplate from '@infrastructure/notification/templates/buy-ticket.email.template';

@Injectable()
export class TicketsConsumer {
  private readonly logger = new Logger(TicketsConsumer.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly ticketService: TicketsService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @RabbitSubscriber(RABBITMQ_QUEUES.BUY_TICKET)
  public async handleBuyTicketMessage(payload: { userId: string; ticketId: string }, properties: any, headers: any): Promise<void> {
    this.logger.debug(`${RABBITMQ_QUEUES.BUY_TICKET.NAME} consumer started!`);

    const retryCount = headers['x-retry'] || 0;

    try {
      const { ticketId, userId } = payload;

      this.logger.log(`Received message for buying ticket: ${ticketId}, for user: ${userId}`);

      const ticket = await this.ticketService.getTicket({
        where: { id: ticketId },
        relations: ['user', 'session', 'session.movie'],
      });

      const { mailSubject, htmlContent } = await generateBuyTicketEmailTemplate(
        ticket.id,
        ticket.session.movie.name,
        ticket.session.date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
        ticket.session.timeSlot,
        this.configService.get('APP.BASE_URL'),
      );
      await this.emailService.sendMail([ticket.user.email], mailSubject, htmlContent);

      this.logger.log(`Email sent to ${ticket.user.email} for ticket: ${ticketId}`);
    } catch (error) {
      this.logger.error('BUY_TICKET_CONSUMER_ERROR', error?.message);

      await this.rabbitMQService.publish(RABBITMQ_QUEUES.BUY_TICKET_FAIL.ROUTING_KEY, payload, retryCount - 1);
    }
  }

  @RabbitSubscriber(RABBITMQ_QUEUES.BUY_TICKET_FAIL)
  public async handleBuyTicketFailMessage(payload: { userId: string; ticketId: string }, properties: any, headers: any): Promise<void> {
    this.logger.debug(`${RABBITMQ_QUEUES.BUY_TICKET_FAIL.NAME} consumer started!`);

    const retryCount = headers['x-retry'] || 0;

    try {
      const { userId, ticketId } = payload;

      this.logger.log(`Received message for buying ticket: ${ticketId}, for user: ${userId}`);

      const ticket = await this.ticketService.getTicket({
        where: { id: ticketId },
        relations: ['user', 'session', 'session.movie'],
      });

      const { mailSubject, htmlContent } = await generateBuyTicketEmailTemplate(
        ticket.id,
        ticket.session.movie.name,
        ticket.session.date.toLocaleDateString(),
        ticket.session.timeSlot,
        this.configService.get('APP.BASE_URL'),
      );
      await this.emailService.sendMail([ticket.user.email], mailSubject, htmlContent);

      this.logger.log(`Email sent to ${ticket.user.email} for ticket: ${ticketId}`);
    } catch (error) {
      this.logger.error('BUY_TICKET_CONSUMER_FAIL_ERROR', error?.message);

      if (retryCount && retryCount > 1) {
        await this.rabbitMQService.publish(RABBITMQ_QUEUES.BUY_TICKET_FAIL.ROUTING_KEY, payload, retryCount - 1);
      }
    }
  }
}
