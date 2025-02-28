/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ERRORS } from '../../src/domain/exceptions/messages';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserEntity } from '@domain/users/entities/user.entity';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { UserRepositoryToken } from '@domain/users/repositories/user-repository.interface';
import { MovieRepositoryToken } from '@domain/movies/repositories/movie-repository.interface';
import { TicketRepositoryToken } from '@domain/tickets/repositories/ticket-repository.interface';
import { SessionRepositoryToken } from '@domain/sessions/repositories/session-repository.interface';
import { movieData1, movieData2, movieData7, movieData8, movieData9, movieData10 } from './mocks/movie-mocks';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let movieRepository: Repository<MovieEntity>;
  let sessionRepository: Repository<SessionEntity>;
  let ticketRepository: Repository<TicketEntity>;
  let userRepository: Repository<UserEntity>;
  let configService: ConfigService;
  let managerToken: string;
  let userToken: string;
  let movieId: string;
  let movieIds: string[];
  let sessionId: string;

  jest.setTimeout(30000);

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

    const managerEmail = configService.get('INITIAL_MANAGER_EMAIL');
    const managerPassword = configService.get('INITIAL_MANAGER_PASSWORD');
    const managerLoginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email: managerEmail,
      password: managerPassword,
    });
    managerToken = managerLoginResponse.body.data.access_token;

    const userEmail = configService.get('INITIAL_USER_EMAIL');
    const userPassword = configService.get('INITIAL_USER_PASSWORD');
    const userLoginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email: userEmail,
      password: userPassword,
    });
    userToken = userLoginResponse.body.data.access_token;
  });

  describe('POST /movies', () => {
    it('should create movie with sessions with manager authorization', async () => {
      const response = await request(app.getHttpServer()).post('/movies').send(movieData1).set('Authorization', `Bearer ${managerToken}`);

      movieId = response.body.data.id;
      sessionId = response.body.data.sessions[0].id;

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.data).toMatchObject({
        name: movieData1.name,
        ageRestriction: movieData1.ageRestriction,
        sessions: expect.arrayContaining([
          expect.objectContaining({
            date: movieData1.sessions[0].date,
            timeSlot: movieData1.sessions[0].timeSlot,
            roomNumber: movieData1.sessions[0].roomNumber,
          }),
        ]),
      });
    });

    it('should fail with user authorization', async () => {
      const response = await request(app.getHttpServer()).post('/movies').send(movieData1).set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe('Forbidden');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).post('/movies').send(movieData1);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /movies', () => {
    it('should get all movies', async () => {
      const response = await request(app.getHttpServer()).get('/movies');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('/movies/:id (GET) - should get movie by id', async () => {
      const response = await request(app.getHttpServer()).get(`/movies/${movieId}`);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data.name).toBe(movieData1.name);
      expect(response.body.data.ageRestriction).toBe(movieData1.ageRestriction);
      expect(response.body.data.sessions).toBeInstanceOf(Array);
      expect(response.body.data.sessions.length).toBe(movieData1.sessions.length);
      expect(response.body.data.sessions[0].date).toBe(movieData1.sessions[0].date);
      expect(response.body.data.sessions[0].timeSlot).toBe(movieData1.sessions[0].timeSlot);
      expect(response.body.data.sessions[0].roomNumber).toBe(movieData1.sessions[0].roomNumber);
    });
  });

  describe('Bulk Operations', () => {
    describe('POST /movies/bulk/add', () => {
      it('should bulk add movies with manager authorization', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/bulk/add')
          .send({ movies: [movieData7, movieData8] })
          .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body.data).toBeInstanceOf(Array);
        movieIds = response.body.data.map((movie: MovieEntity) => movie.id);
      });

      it('should rollback transaction for conflicting sessions', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/bulk/add')
          .send({ movies: [movieData9, movieData10] })
          .set('Authorization', `Bearer ${managerToken}`);
        expect(response.status).toBe(HttpStatus.CONFLICT);
        expect(response.body).toMatchObject({
          error: ERRORS.SESSION_ALREADY_EXISTS.error,
          message: ERRORS.SESSION_ALREADY_EXISTS.message,
        });
      });

      it('should fail bulk add movies with user authorization', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/bulk/add')
          .send({ movies: [movieData9, movieData10] })
          .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe('Forbidden');
      });

      it('should fail bulk add movies without authentication', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/bulk/add')
          .send({ movies: [movieData9, movieData10] });
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('Unauthorized');
      });
    });

    describe('POST /movies/bulk/delete', () => {
      it('should bulk delete movies with manager authorization', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/bulk/delete')
          .send({ movieIds: movieIds })
          .set('Authorization', `Bearer ${managerToken}`);
        expect(response.status).toBe(HttpStatus.CREATED);
      });

      it('should fail bulk delete movies with user authorization', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/bulk/delete')
          .send({ movieIds: movieIds })
          .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toBe('Forbidden');
      });

      it('should fail bulk delete movies without authentication', async () => {
        const response = await request(app.getHttpServer()).post('/movies/bulk/delete').send({ movieIds: movieIds });
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toBe('Unauthorized');
      });
    });
  });

  it('/movies/:id (PUT) - should update movie with manager authorization', async () => {
    const response = await request(app.getHttpServer())
      .put(`/movies/${movieId}`)
      .send(movieData2)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.name).toBe(movieData2.name);
    expect(response.body.data.ageRestriction).toBe(movieData2.ageRestriction);
  });

  it('/movies/:id (PUT) - should fail update movie with user authorization', async () => {
    const response = await request(app.getHttpServer())
      .put(`/movies/${movieId}`)
      .send(movieData2)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe('Forbidden');
  });

  it('/movies/:id (PUT) - should fail update movie without authentication', async () => {
    const response = await request(app.getHttpServer()).put(`/movies/${movieId}`).send(movieData2);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/movies/:id (DELETE) - should delete movie with manager authorization', async () => {
    const response = await request(app.getHttpServer()).delete(`/movies/${movieId}`).set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data.id).toBe(movieId);
  });

  it('/movies/:id (DELETE) - should fail delete movie with user authorization', async () => {
    const response = await request(app.getHttpServer()).delete(`/movies/${movieId}`).set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe('Forbidden');
  });

  it('/movies/:id (DELETE) - should fail delete movie without authentication', async () => {
    const response = await request(app.getHttpServer()).delete(`/movies/${movieId}`);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe('Unauthorized');
  });

  afterAll(async () => {
    await app.close();
  });
});
