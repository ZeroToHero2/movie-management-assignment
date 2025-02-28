/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { movieData5, movieData6 } from './mocks/movie-mocks';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { authenticateUser } from './helpers/auth';
import { UserEntity } from '@domain/users/entities/user.entity';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { createMovies, createSessions } from './helpers/util';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { UserRepositoryToken } from '@domain/users/repositories/user-repository.interface';
import { MovieRepositoryToken } from '@domain/movies/repositories/movie-repository.interface';
import { TicketRepositoryToken } from '@domain/tickets/repositories/ticket-repository.interface';
import { SessionRepositoryToken } from '@domain/sessions/repositories/session-repository.interface';
import { sessionData5, sessionData6, sessionData7, sessionData8, sessionData9 } from './mocks/sessions-mocks';

describe('SessionsController (e2e)', () => {
  let app: INestApplication;
  let movieRepository: Repository<MovieEntity>;
  let sessionRepository: Repository<SessionEntity>;
  let ticketRepository: Repository<TicketEntity>;
  let userRepository: Repository<UserEntity>;
  let configService: ConfigService;
  let managerToken: string;
  let userToken: string;
  let firstMovieId: string;
  let secondMovieId: string;
  let firstSessionId: string;
  let secondSessionId: string;

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
    userRepository = moduleFixture.get<Repository<UserEntity>>(UserRepositoryToken);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    managerToken = (await authenticateUser(app, 'INITIAL_MANAGER_EMAIL', 'INITIAL_MANAGER_PASSWORD')).access_token;
    userToken = (await authenticateUser(app, 'INITIAL_USER_EMAIL', 'INITIAL_USER_PASSWORD')).access_token;

    const movies = await createMovies(movieRepository, [movieData5, movieData6]);
    firstMovieId = movies[0].id;
    secondMovieId = movies[1].id;

    const sessions = await createSessions(sessionRepository, [sessionData5, sessionData6], movies);
    firstSessionId = sessions[0].id;
    secondSessionId = sessions[1].id;
  });

  describe('POST /sessions/:movieId', () => {
    describe('when user is a manager', () => {
      it('should successfully create a session', async () => {
        const response = await request(app.getHttpServer())
          .post(`/sessions/${firstMovieId}`)
          .send(sessionData7)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body.data).toMatchObject({
          date: sessionData7.date,
          timeSlot: sessionData7.timeSlot,
          roomNumber: sessionData7.roomNumber,
          movie: { id: firstMovieId },
        });
      });
    });

    describe('when user is unauthorized', () => {
      it('should return unauthorized error', async () => {
        const response = await request(app.getHttpServer()).post(`/sessions/${firstMovieId}`).send(sessionData8);

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('Unauthorized');
      });
    });

    describe('when user is not a manager', () => {
      it('should return forbidden error', async () => {
        const response = await request(app.getHttpServer())
          .post(`/sessions/${firstMovieId}`)
          .send(sessionData9)
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe('Forbidden');
      });
    });
  });

  describe('DELETE /sessions/:sessionId', () => {
    describe('when user is a manager', () => {
      it('should successfully delete the session', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/sessions/${firstSessionId}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data).toMatchObject({
          result: true,
        });
      });
    });

    describe('when user is not a manager', () => {
      it('should return forbidden error', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/sessions/${secondSessionId}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe('Forbidden');
      });
    });

    describe('when user is unauthorized', () => {
      it('should return unauthorized error', async () => {
        const response = await request(app.getHttpServer()).delete(`/sessions/${firstSessionId}`);

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('Unauthorized');
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
