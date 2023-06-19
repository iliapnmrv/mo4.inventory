// import { StockAction } from 'src/types/types';
import type { StockAction } from '.prisma/client';

export class LogStockDto {
  description: string | null;
  amount: number;
  type: StockAction;
}
