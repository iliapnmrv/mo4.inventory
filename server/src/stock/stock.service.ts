import { Injectable } from '@nestjs/common';
import { CatalogService } from 'src/catalog/catalog.service';
import { PrismaService } from 'src/prisma.service';
import { TokenPayload } from 'src/types/types';
import { CreateStockDto } from './dto/create-stock.dto';
import { LogStockDto } from './dto/log-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StocksQuery } from './stock.controller';
import * as XLSX from 'xlsx';
import * as path from 'path';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private catalogService: CatalogService,
  ) {}

  async create(createStockDto: CreateStockDto, user: TokenPayload) {
    return await this.prisma.stock.create({ data: createStockDto });
  }

  async findAll({
    item_qr,
    q,
    device_id,
    limit,
    offset,
    period,
  }: Partial<StocksQuery>) {
    const q_catalogs = await this.catalogService.findAll(q);

    const stock_items = await this.prisma.stock.findMany({
      where: {
        device_id: device_id ? +device_id : undefined,
        items: item_qr ? { none: { qr: +item_qr } } : undefined,
        OR: q
          ? [
              { name: { contains: q } },
              { description: { contains: q } },
              { logs: { some: { description: { contains: q } } } },
              {
                device_id: {
                  in: q_catalogs.stock_device.map((status) => status.id),
                },
              },
              !isNaN(+q) ? { items: { some: { qr: +q } } } : null,
            ]
          : undefined,
      },
      include: {
        logs: {
          where: {
            created_at: {
              gte: new Date(period || '1970-01-01Z00:00:00:000'),
            },
          },
          orderBy: { created_at: 'desc' },
        },
        device: true,
      },
      skip: offset,
      take: limit,
    });

    return stock_items.map((stock) => {
      return {
        ...stock,
        taken: stock.logs.reduce(
          (acc, cur) => (cur.type === 'add' ? acc + cur.amount : acc + 0),
          0,
        ),
        given: stock.logs.reduce(
          (acc, cur) => (cur.type === 'sub' ? acc + cur.amount : acc + 0),
          0,
        ),
        last_sub: stock.logs.find((log) => log.type === 'sub')?.created_at,
        last_add: stock.logs.find((log) => log.type === 'add')?.created_at,
      };
    });
  }

  async findOne(id: number) {
    return await this.prisma.stock.findUnique({ where: { id } });
  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    return await this.prisma.stock.update({
      where: { id },
      data: updateStockDto,
    });
  }

  async logStock(id: number, dto: LogStockDto, user: TokenPayload) {
    const stock = await this.prisma.stock.findFirst({
      where: { id },
      select: { quantity: true },
    });

    await this.prisma.stock.update({
      where: { id },
      data: {
        quantity: {
          [dto.type === 'add' ? 'increment' : 'decrement']: dto.amount,
        },
      },
    });

    return await this.prisma.stock_log.create({
      data: {
        ...dto,
        author: user.fio,
        stock_item_id: id,
        description: `${
          dto.type === 'add' ? `Приход ${dto.amount}` : `Выдача ${dto.amount}`
        }. ${stock.quantity} -> ${
          stock.quantity + (dto.type === 'add' ? +dto.amount : -dto.amount)
        }${dto.description ? `. Описание: ${dto.description}` : ''}`,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.stock.delete({ where: { id } });
  }

  async removeStockLog(id: number) {
    const log = await this.prisma.stock_log.delete({ where: { id } });

    await this.prisma.stock.update({
      where: { id: log.stock_item_id },
      data: {
        quantity: {
          [log.type === 'add' ? 'decrement' : 'increment']: log.amount,
        },
      },
    });
  }

  async export({
    item_qr,
    q,
    device_id,
    limit,
    offset,
    period,
  }: Partial<StocksQuery>): Promise<string> {
    const q_catalogs = await this.catalogService.findAll(q);

    const databaseData = {
      Картриджи: await this.prisma.stock.findMany({
        where: {
          device_id: device_id ? +device_id : undefined,
          items: item_qr ? { none: { qr: +item_qr } } : undefined,
          OR: q
            ? [
                { name: { contains: q } },
                {
                  description: { contains: q },
                },
                {
                  device_id: {
                    in: q_catalogs.stock_device.map((status) => status.id),
                  },
                },
                !isNaN(+q) ? { items: { some: { qr: +q } } } : null,
              ]
            : undefined,
        },
        include: {
          logs: {
            where: {
              created_at: {
                gte: new Date(period || '1970-01-01Z00:00:00:000'),
              },
            },
            orderBy: { created_at: 'desc' },
          },
          device: true,
        },
        skip: offset,
        take: limit,
      }),
    };

    const wb = XLSX.utils.book_new();

    Object.keys(databaseData).map((key) => {
      const sheet = XLSX.utils.json_to_sheet(databaseData[key]);
      XLSX.utils.book_append_sheet(wb, sheet, key);
    });
    const date = new Date();

    const [month, day, year] = [
      date.getMonth(),
      date.getDate(),
      date.getFullYear(),
    ];
    const fileName = `Картриджи ${day}.${String(month + 1).padStart(
      2,
      '0',
    )}.${year}.xlsx`;

    const filePath = path.join(__dirname, '..', '..', 'static', fileName);

    XLSX.writeFileXLSX(wb, filePath, {
      type: 'file',
    });

    return fileName;
  }
}
