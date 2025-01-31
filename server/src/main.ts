import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as moment from 'moment';
//@ts-ignore
import localization from 'moment/locale/ru.js';
import { json, urlencoded } from 'express';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

const ENV = process.env.NODE_ENV;

const API_DOCS_PREFIX = 'docs';
moment.updateLocale('ru', localization);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const hostname = configService.get('HOST');

  const basePath = new URL(`${hostname}:${port}`);
  const apiUrl = `${basePath.href}api/v1`;

  const config = new DocumentBuilder()
    .setTitle('Инвентаризация')
    .setDescription('Инвентаризация API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http' })
    .addServer(apiUrl)
    .setContact('Ilia', 'https://pnmrv.com', 'iliapnmrvv@gmail.com')
    .build();

  // http://localhost:1337/docs
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  });
  SwaggerModule.setup(API_DOCS_PREFIX, app, document, {});

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      enableDebugMessages: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.enableCors({ credentials: true });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(basePath.port, basePath.hostname, () =>
    Logger.debug(`
env: ${ENV}
api: ${apiUrl}
docs: ${basePath.href}${API_DOCS_PREFIX}
docs-json: ${basePath.href}${API_DOCS_PREFIX}-json
static: ${basePath.href}file/{file_name}
    `),
  );
}
bootstrap();
