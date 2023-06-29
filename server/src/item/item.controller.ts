import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemService } from './item.service';

export type Query = {
  q?: string;
  user_id?: number[];
  device_id?: number[];
  type_id?: number[];
  person_id?: number[];
  status_id?: number[];
  place_id?: number[];
  include?: boolean;
  includeLogs: boolean;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  showArchive?: string;
  showZeroCartridges?: string;
  stock_item?: number;
} & PaginationParams;

export type PaginationParams = { offset?: number; limit?: number };

export type SuggestionQuery = {
  q?: string;
  field?: 'qr' | undefined;
};

@ApiTags('Item')
@Controller('item')
// @UseFilters(ViewAuthFilter)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new item',
  })
  create(@Body() createItemDto: CreateItemDto, @Req() { user }: Request) {
    return this.itemService.create(createItemDto, user);
  }

  @ApiOperation({
    summary: 'Get all available names',
  })
  @Get('names')
  findAvailableNames() {
    return this.itemService.findUniqueNames();
  }

  @ApiOperation({
    summary: 'Check if serial number is available',
  })
  @Get('serial_number')
  findSerialNumberAvailable(@Query('serial_number') serial_number: string) {
    return this.itemService.findSerialNumberAvailable(serial_number);
  }

  @Get('last_qr')
  findLastQr() {
    return this.itemService.findLastQR();
  }

  /**
   * Find suggestions
   */
  @Get('suggestions')
  findSearchSuggestions(@Query() query: SuggestionQuery) {
    return this.itemService.findSuggestions(query);
  }

  /**
   * Get all items
   */
  @Get()
  findAll(@Query() query: Query) {
    return this.itemService.findAll(query);
  }

  /**
   * export
   */
  @Get('export')
  export(@Query() query: Query) {
    return this.itemService.export(query);
  }

  /**
   * Get one item
   */
  @Get(':qr')
  findOne(@Param('qr') qr: string) {
    return this.itemService.findOne(+qr);
  }

  /**
   * Update multiple qrs
   */
  @ApiCookieAuth()
  @ApiResponse({
    status: 201,
    description: 'The records have been successfully updated',
    isArray: true,
  })
  @Patch('qrs')
  updateMany(
    @Query('qrs') qrs: string,
    @Body() updateItemDto: UpdateItemDto,
    @Req() { user }: Request,
  ) {
    return this.itemService.updateMany(qrs, updateItemDto, user);
  }

  @Patch(':qr')
  update(
    @Param('qr') qr: string,
    @Body() updateItemDto: UpdateItemDto,
    @Req() { user }: Request,
  ) {
    return this.itemService.update(+qr, updateItemDto, user);
  }

  @Patch('archive/:qr')
  moveToArchive(@Param('qr') qr: string, @Req() { user }: Request) {
    return this.itemService.moveToArchive(+qr, user);
  }

  @Delete(':qr')
  remove(@Param('qr') qr: string, @Req() { user }: Request) {
    return this.itemService.remove(+qr, user);
  }

  @Post(':model/stock/:stockId')
  addStock(
    @Param('model') model: string,
    @Param('stockId') stockId: string,
    @Req() { user }: Request,
  ) {
    return this.itemService.addStock(model, +stockId, user);
  }

  @Delete(':model/stock/:stockId')
  removeStock(
    @Param('model') model: string,
    @Param('stockId') stockId: string,
    @Req() { user }: Request,
  ) {
    return this.itemService.removeStock(model, +stockId, user);
  }
}
