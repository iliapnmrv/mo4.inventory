import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { CatalogEntity } from './entities/catalog.entity';

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
@ApiParam({ name: 'catalog', enumName: 'Catalog', enum: Catalogs })
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post(':catalog')
  createCatalog(
    @Body() createCatalogDto: CreateCatalogDto,
    @Param('catalog') catalog: Catalogs,
  ): Promise<CatalogEntity> {
    return this.catalogService.create(catalog, createCatalogDto);
  }

  @Get()
  findAllCatalogs() {
    return this.catalogService.findAll();
  }

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
  ): Promise<CatalogEntity> {
    return this.catalogService.update(catalog, +id, updateCatalogDto);
  }

  @Delete(':catalog/:id')
  remove(@Param('id') id: string, @Param('catalog') catalog: Catalogs) {
    return this.catalogService.remove(catalog, +id);
  }
}
