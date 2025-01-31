import { Device, Person, Place, Status, Type } from '@prisma/client';

type Catalog = Person & Place & Status & Device & Type;

export class CatalogEntity implements Catalog {
  id: number;
  name: string;
}
