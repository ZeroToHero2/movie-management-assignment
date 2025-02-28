import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('AuthController (e2e)', () => {
  const testUserCredentials: {
    username: string;
    email: string;
    password: string;
    age: number;
  } = {
    email: 'test-user@example.com',
    password: 'test-user-password',
    age: 20,
    username: 'test-user',
  };

  const testManagerCredentials: {
    username: string;
    email: string;
    password: string;
    age: number;
  } = {
    email: 'test-manager@example.com',
    password: 'test-manager-password',
    username: 'test-manager',
    age: 30,
  };

  let app: INestApplication;
  let managerToken: string;
  let configService: ConfigService;

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
      providers: [
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  it('/auth/register (POST) - Successful signup => 201', async () => {
    const response = await request(app.getHttpServer()).post('/auth/signup').send(testUserCredentials).expect(HttpStatus.CREATED);

    expect(response.body.data).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - Valid credentials => 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUserCredentials.email,
        password: testUserCredentials.password,
      })
      .expect(HttpStatus.CREATED);

    expect(response.body.data).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - Wrong password => Invalid credentials (400)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUserCredentials.email,
        password: 'wrong-password',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/auth/manager (POST) - Unauthorized Action For User => Unauthorized (401)', async () => {
    await request(app.getHttpServer())
      .post('/auth/manager')
      .send({
        username: testManagerCredentials.username,
        email: testManagerCredentials.email,
        password: testManagerCredentials.password,
        age: testManagerCredentials.age,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/auth/manager (POST) - Authorized Action For Manager => 201', async () => {
    const email = configService.get('INITIAL_MANAGER_EMAIL');
    const password = configService.get('INITIAL_MANAGER_PASSWORD');
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: password,
      })
      .expect(HttpStatus.CREATED);

    managerToken = loginResponse.body.data.access_token;

    const response = await request(app.getHttpServer())
      .post('/auth/manager')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        email: 'new-manager@example.com',
        password: 'manager-password',
        username: 'New Manager',
        age: 20,
      })
      .expect(HttpStatus.CREATED);

    expect(response.body.data).toHaveProperty('access_token');
  });

  afterAll(async () => {
    await app.close();
  });
});
