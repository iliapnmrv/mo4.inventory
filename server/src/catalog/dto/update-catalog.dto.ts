import { Status } from '.prisma/client';

export interface UpdateCatalogDto extends Omit<Status, 'id'> {}

export class UpdateCatalogDto {}
