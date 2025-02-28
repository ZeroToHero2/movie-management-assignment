import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

export async function authenticateUser(app: INestApplication, emailEnvKey: string, passwordEnvKey: string) {
  const configService = app.get<ConfigService>(ConfigService);

  const email = configService.get(emailEnvKey);
  const password = configService.get(passwordEnvKey);

  const response = await request(app.getHttpServer()).post('/auth/login').send({
    email: email,
    password: password,
  });

  return response.body.data;
}
