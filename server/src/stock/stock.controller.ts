import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from '.prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { LogStockDto } from './dto/log-stock.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PaginationParams } from 'src/item/item.controller';

export type StocksQuery = {
  q: string;
  item_qr: number;
  device_id: number;
  period: string;
} & PaginationParams;

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createStockDto: CreateStockDto, @Req() { user }: Request) {
    return this.stockService.create(createStockDto, user);
  }

  @Get()
  findAll(@Query() query: Partial<StocksQuery>): Promise<Stock[]> {
    return this.stockService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
    @Req() { user }: Request,
  ) {
    return this.stockService.update(+id, updateStockDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/log')
  logStock(
    @Param('id') id: string,
    @Body() logStockDto: LogStockDto,
    @Req() { user }: Request,
  ) {
    return this.stockService.logStock(+id, logStockDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(+id);
  }

  @Delete('log/:id')
  removeStock(@Param('id') id: string) {
    return this.stockService.removeStockLog(+id);
  }
}
