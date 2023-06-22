import { Stock } from '.prisma/client';

type dto = Omit<Stock, 'id'>;

export interface CreateStockDto extends dto {}
