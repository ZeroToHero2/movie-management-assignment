import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture = await Test.createTestingModule({
      imports: [
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
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000); // Increased timeout to 30 seconds

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);
    expect(response.body.message).toBe('Welcome to the Movie Management API!');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
