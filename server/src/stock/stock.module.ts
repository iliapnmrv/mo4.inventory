import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { JwtStrategy } from 'src/jwt.strategy';
import { PrismaService } from 'src/prisma.service';
import { CatalogService } from 'src/catalog/catalog.service';

@Module({
  controllers: [StockController],
  providers: [StockService, PrismaService, JwtStrategy, CatalogService],
})
export class StockModule {}
