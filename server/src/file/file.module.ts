import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/jwt.strategy';

@Module({
  providers: [FileService, PrismaService, JwtStrategy],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
