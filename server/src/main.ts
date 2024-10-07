import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as moment from 'moment';
//@ts-ignore
import localization from 'moment/locale/ru.js';
import { json, urlencoded } from 'express';

moment.updateLocale('ru', localization);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  app.enableCors({ credentials: true });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const config = new DocumentBuilder()
    .setTitle('Инвентаризация')
    .setDescription('Описание API инвентаризации')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('PORT'), () => {
    console.log(
      'runnin on port',
      configService.get('PORT'),
      configService.get('NODE_ENV'),
    );
  });
}
bootstrap();
