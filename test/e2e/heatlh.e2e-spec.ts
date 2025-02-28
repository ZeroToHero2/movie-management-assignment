import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.body.message).toBe('Welcome to the Movie Management API!');
  });

  it('/health liveness (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/health/liveness');
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});
