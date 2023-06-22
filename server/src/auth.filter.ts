/* eslint-disable prettier/prettier */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch(UnauthorizedException)
export class ViewAuthFilter implements ExceptionFilter {
  constructor(private configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const client_url = this.configService.get<string>('CLIENT_URL');

    response.status(status).redirect(`${client_url}403`);
  }
}
