import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';

export enum Catalogs {
  'person' = 'person',
  'status' = 'status',
  'user' = 'user',
  'place' = 'place',
  'device' = 'device',
  'type' = 'type',
  'stock_device' = 'stock_device',
}

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Create new catalog
   */
  @ApiParam({ name: 'catalog', enum: Catalogs })
  @Post(':catalog')
  create(
    @Body() createCatalogDto: CreateCatalogDto,
    @Param('catalog') catalog: Catalogs,
  ) {
    return this.catalogService.create(catalog, createCatalogDto);
  }

  /**
   * Get all catalogs
   */
  @Get()
  findAll() {
    return this.catalogService.findAll();
  }

  /**
   * Check if no item is connected to catalog
   */
  @ApiParam({ name: 'catalog', enum: Catalogs })
  @Get('available-to-delete/:catalog/:id')
  availableToDelete(
    @Param('id') id: string,
    @Param('catalog') catalog: Catalogs,
  ) {
    return this.catalogService.findAvailableToDelete(catalog, +id);
  }

  @Get(':catalog')
  findByName(@Param('catalog') catalog: Catalogs) {
    return this.catalogService.findOne(catalog);
  }

  @Patch(':catalog/:id')
  update(
    @Param('id') id: string,
    @Param('catalog') catalog: Catalogs,
    @Body() updateCatalogDto: UpdateCatalogDto,
  ) {
    return this.catalogService.update(catalog, +id, updateCatalogDto);
  }

  @Delete(':catalog/:id')
  remove(@Param('id') id: string, @Param('catalog') catalog: Catalogs) {
    return this.catalogService.remove(catalog, +id);
  }
}
