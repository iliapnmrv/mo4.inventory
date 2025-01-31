import { OmitType } from '@nestjs/swagger';
import { CatalogEntity } from '../entities/catalog.entity';

export class CreateCatalogDto extends OmitType(CatalogEntity, ['id']) {}
