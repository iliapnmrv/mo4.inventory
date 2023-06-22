import { Inventory_report } from '.prisma/client';

export class ImportInventoryReportDto {
  qrs: number[];
  inventory: (Inventory_report & { updatedAt: Date })[];
}
