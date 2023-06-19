import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from './types/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(protected configService: ConfigService) {
    super({
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // const data = request?.cookies?.['dataToken'];
          const data =
            configService.get('NODE_ENV') === 'development'
              ? // Неавторизованный пользователь
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wiZmlvXCI6XCLQndC10LDQstGC0L7RgNC40LfQvtCy0LDQvdC90YvQuSDQv9C-0LvRjNC30L7QstCw0YLQtdC70YxcIixcImlkXCI6MzE4LFwiYWNjb3VudFwiOlwic21pa2hheWxvdlwiLFwicHJvamVjdHNcIjp7XCJtZWRrb21pc3NpYVwiOjEsXCJpbnZlbnRvcnlcIjoxLFwiZW5lcmdldGljc1wiOjEsXCJjYXJ0cmlkZ2VcIjoxLFwicGl0YW5pZVwiOjF9fSIsImlhdCI6MTY3MjIzMjk1MCwiZXhwIjoxNzAzNzY4OTUwfQ.FB8_ke-O5RNbFTUT_jC0LW9w23J7gQKxZ7XxG1qVQ_A'
              : request?.cookies?.['dataToken'] ??
                // Михайлов
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wiZmlvXCI6XCLQnNC40YXQsNC50LvQvtCyINCh0LXRgNCz0LXQuSDQk9C10L3QvdCw0LTRjNC10LLQuNGHXCIsXCJpZFwiOjMxOCxcImFjY291bnRcIjpcInNtaWtoYXlsb3ZcIixcInByb2plY3RzXCI6e1wibWVka29taXNzaWFcIjoxLFwiaW52ZW50b3J5XCI6MSxcImVuZXJnZXRpY3NcIjoxLFwiY2FydHJpZGdlXCI6MSxcInBpdGFuaWVcIjoxfX0iLCJpYXQiOjE2NzIyMzI5NTAsImV4cCI6MTcwMzc2ODk1MH0.Rvkw6qM3Hfqj4ksLuELlRMnGqlbrhTj8xwBXPHqfdkQ';

          if (!data) {
            return null;
          }
          return data;
        },
      ]),
    });
  }

  async validate(payload: any): Promise<TokenPayload> {
    if (payload === null) {
      throw new UnauthorizedException();
    }

    const parsed = JSON.parse(payload.data);
    return {
      ...parsed,
      fio: parsed.fio.replace(/(.+) (.).+ (.).+/, '$1 $2. $3.'),
    };
  }
}
