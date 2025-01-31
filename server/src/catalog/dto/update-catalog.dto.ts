import { OmitType } from '@nestjs/swagger';
import { CatalogEntity } from '../entities/catalog.entity';

export class UpdateCatalogDto extends OmitType(CatalogEntity, ['id']) {}
