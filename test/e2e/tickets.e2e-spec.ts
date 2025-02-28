/* eslint-disable @typescript-eslint/no-unused-vars */
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ERRORS } from '../../src/domain/exceptions/messages';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { authenticateUser } from './helpers/auth';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { createMovies, createSessions } from './helpers/util';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { movieData3, movieData4, movieData11 } from './mocks/movie-mocks';
import { sessionData3, sessionData4, sessionData11 } from './mocks/sessions-mocks';
import { MovieRepositoryToken } from '@domain/movies/repositories/movie-repository.interface';
import { TicketRepositoryToken } from '@domain/tickets/repositories/ticket-repository.interface';
import { SessionRepositoryToken } from '@domain/sessions/repositories/session-repository.interface';

describe('TicketsController (e2e)', () => {
  let app: INestApplication;
  let movieRepository: Repository<MovieEntity>;
  let sessionRepository: Repository<SessionEntity>;
  let ticketRepository: Repository<TicketEntity>;
  let managerToken: string;
  let userToken: string;
  let firstMovieId: string;
  let secondMovieId: string;
  let firstSessionId: string;
  let secondSessionId: string;
  let thirdSessionId: string;
  let managerFirstTicketId: string;
  let userFirstTicketId: string;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          url: process.env.TEST_DATABASE_URL,
          type: 'postgres',
          entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
        }),
        RabbitMQModule.forRootAsync({
          useFactory: () => ({
            uri: process.env.TEST_RABBITMQ_URL || 'amqp://localhost:5673',
          }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    movieRepository = moduleFixture.get<Repository<MovieEntity>>(MovieRepositoryToken);
    sessionRepository = moduleFixture.get<Repository<SessionEntity>>(SessionRepositoryToken);
    ticketRepository = moduleFixture.get<Repository<TicketEntity>>(TicketRepositoryToken);

    try {
      managerToken = (await authenticateUser(app, 'INITIAL_MANAGER_EMAIL', 'INITIAL_MANAGER_PASSWORD')).access_token;
      userToken = (await authenticateUser(app, 'INITIAL_USER_EMAIL', 'INITIAL_USER_PASSWORD')).access_token;

      const movies = await createMovies(movieRepository, [movieData3, movieData4, movieData11]);
      firstMovieId = movies[0].id;
      secondMovieId = movies[1].id;

      const sessions = await createSessions(sessionRepository, [sessionData3, sessionData4, sessionData11], movies);
      firstSessionId = sessions[0].id;
      secondSessionId = sessions[1].id;
      thirdSessionId = sessions[2].id;
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  it('/tickets/:sessionId/checkout (POST) - should fail buy ticket without authentication', async () => {
    const response = await request(app.getHttpServer()).post(`/tickets/${firstSessionId}/checkout`);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/tickets/:sessionId/checkout (POST) - user should not buy ticket because he/she is not old enough', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${firstSessionId}/checkout`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.error).toBe(ERRORS.USER_NOT_OLD_ENOUGH.error);
    expect(response.body.message).toBe(ERRORS.USER_NOT_OLD_ENOUGH.message);
  });

  it('/tickets/:sessionId/checkout (POST) - user should not buy ticket because session is already passed', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${thirdSessionId}/checkout`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.error).toBe(ERRORS.SESSION_ALREADY_PASSED.error);
    expect(response.body.message).toBe(ERRORS.SESSION_ALREADY_PASSED.message);
  });

  it('/tickets/:sessionId/checkout (POST) - user should buy ticket because he/she is old enough', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${secondSessionId}/checkout`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.session.movie.id).toBe(secondMovieId);
    expect(response.body.data.session.id).toBe(secondSessionId);
    userFirstTicketId = response.body.data.id;
  });

  it('/tickets/:sessionId/checkout (POST) - manager should buy ticket', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${firstSessionId}/checkout`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.session.movie.id).toBe(firstMovieId);
    expect(response.body.data.session.id).toBe(firstSessionId);
    managerFirstTicketId = response.body.data.id;
  });

  it('/tickets/:ticketId/watch (POST) - manager should watch movie with his/her ticket', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${managerFirstTicketId}/watch`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('/tickets/:ticketId/watch (POST) - manager should not watch movie with his/her used ticket', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${managerFirstTicketId}/watch`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.body.error).toBe(ERRORS.TICKET_ALREADY_USED.error);
    expect(response.body.message).toBe(ERRORS.TICKET_ALREADY_USED.message);
  });

  it('/tickets/:ticketId/watch (POST) - user should watch movie with his/her ticket', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${userFirstTicketId}/watch`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('/tickets/:ticketId/watch (POST) - user should not watch movie with his/her used ticket', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tickets/${userFirstTicketId}/watch`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.body.error).toBe(ERRORS.TICKET_ALREADY_USED.error);
    expect(response.body.message).toBe(ERRORS.TICKET_ALREADY_USED.message);
  });

  afterAll(async () => {
    await app.close();
  });
});
