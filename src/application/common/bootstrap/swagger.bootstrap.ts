import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const BootstrapSwagger = (app: INestApplication, configService: ConfigService) => {
  const {
    TITLE,
    DESCRIPTION,
    VERSION,
    CONTACT: { NAME, URL, EMAIL },
  } = configService.get('SWAGGER_OPTIONS');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(TITLE)
    .setDescription(DESCRIPTION)
    .setVersion(VERSION)
    .setContact(NAME, URL, EMAIL)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('documentation', app, document);
};
