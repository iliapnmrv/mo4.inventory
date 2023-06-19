import { TokenPayload } from '../types';

declare module 'express' {
  interface Request {
    user: TokenPayload;
  }
}
