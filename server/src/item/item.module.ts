import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/jwt.strategy';
import { CatalogService } from 'src/catalog/catalog.service';

@Module({
  imports: [],
  controllers: [ItemController],
  providers: [ItemService, PrismaService, JwtStrategy, CatalogService],
})
export class ItemModule {}
