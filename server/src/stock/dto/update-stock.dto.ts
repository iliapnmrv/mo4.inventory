import { Stock } from '.prisma/client';

type dto = Partial<Omit<Stock, 'id'>>;

export interface UpdateStockDto extends dto {}
