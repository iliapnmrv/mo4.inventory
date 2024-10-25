import { Inventory_report, Inventory_scanned } from '.prisma/client';

export class ImportInventoryReportDto {
  scanned: Inventory_scanned[];
  inventory: (Inventory_report & { updatedAt: Date })[];
}
