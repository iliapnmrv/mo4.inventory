import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import * as XLSX from 'xlsx';
import { Inventory as IInventory } from '.prisma/client';
import { ImportInventoryReportDto } from './dto/import-inventory-report.dto';
import * as moment from 'moment';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async upload(inventory: Express.Multer.File): Promise<number> {
    const workbook = XLSX.readFile(inventory.path);
    const inventoryData: Array<Omit<IInventory, 'id'>> =
      XLSX.utils.sheet_to_json(workbook.Sheets['17 эталонный в ДокОборот']);

    const requiredKeys = ['vedpos', 'name', 'place', 'kolvo', 'place_priority'];

    if (
      inventoryData?.length &&
      JSON.stringify(Object.keys(inventoryData?.[0]).sort()) !==
        JSON.stringify(requiredKeys.sort())
    ) {
      fs.unlinkSync(join(__dirname, '..', '..', inventory.path));
      throw new HttpException(
        'Неверные наименования столбцов',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.inventory.deleteMany({});

    const created = await this.prisma.inventory.createMany({
      data: inventoryData,
    });

    return created.count;
  }

  async importReport(importInventory: ImportInventoryReportDto) {
    const { scanned, inventory } = importInventory;

    await this.prisma.inventory_report.deleteMany({});
    await this.prisma.inventory_not_found.deleteMany({});
    await this.prisma.inventory_scanned.deleteMany({});

    const scannedQrs: number[] = scanned.map((scan) => scan.inventoryNum);

    const items = await this.prisma.item.findMany({
      where: {
        NOT: {
          qr: {
            in: scannedQrs,
          },
        },
      },
      select: { qr: true },
    });

    await this.prisma.inventory_not_found.createMany({
      data: items.map((item) => ({ item_qr: item.qr })),
    });

    await this.prisma.inventory_scanned.createMany({
      data: scanned.map(({ id, ...scan }) => ({
        ...scan,
        createdAt: moment(scan.createdAt).toDate(),
      })),
    });

    await this.prisma.inventory_report.createMany({
      data: inventory.map(({ updatedAt, ...inventory }) => inventory),
    });

    await this.prisma.$transaction(
      scanned.map(({ inventoryNum, createdAt }) =>
        this.prisma.item.update({
          where: { qr: +inventoryNum },
          data: { last_found_at: moment(createdAt).toDate() },
        }),
      ),
    );

    return { data: 'Успешно загружено' };
  }

  async findReport() {
    // const inventory = await this.prisma.inventory.findMany();
    const inventory_report = await this.prisma.inventory_report.findMany({
      where: { kolvo: { not: 0 } },
    });

    const results = await Promise.all(
      inventory_report.map(async ({ id, name, ...inventory_rest }) => {
        return {
          items: await this.prisma.inventory_not_found.findMany({
            select: {
              item: {
                include: {
                  device: { select: { name: true } },
                  person: { select: { name: true } },
                  place: { select: { name: true } },
                  status: { select: { name: true } },
                  user: { select: { name: true } },
                  type: { select: { name: true } },
                },
              },
            },
            where: { item: { name } },
          }),
          ...inventory_rest,
          name,
          _count: await this.prisma.item.count({
            where: { name },
          }),
          not_found: await this.prisma.inventory_not_found.count({
            where: { item: { name } },
          }),
          kolvo: (
            await this.prisma.inventory.findFirst({
              where: {
                place: inventory_rest.place,
                vedpos: inventory_rest.vedpos,
              },
            })
          )?.kolvo,
          remainder: inventory_rest.kolvo,
        };
      }),
    );

    // console.log(found);

    // const res = results.map((item) => ({
    //   ...item,
    //   remainder: found
    //     .filter((foundItem) => foundItem.name === item.name)
    //     .map((item, index, itemSrc) =>
    //       results
    //         .filter((result) => result.name === item.name)
    //         ?.reduce(
    //           (prev, cur) =>
    //             prev?.kolvo < cur?.kolvo && cur.kolvo !== 0 ? prev : cur,
    //           null,
    //         ),
    //     ),
    // }));

    // return res;

    return results;
  }

  async findAll() {
    return await this.prisma.inventory.findMany();
  }

  async analyzeAll() {
    const listed = (
      await this.prisma.inventory.groupBy({
        by: ['name'],
        _sum: { kolvo: true },
      })
    ).map((item) => ({ listed: item._sum.kolvo, name: item.name }));
    const in_stock = (
      await this.prisma.item.groupBy({
        by: ['name'],
        _count: true,
        where: { name: { not: 'Не в учете' } },
      })
    ).map((item) => ({ in_stock: item._count, name: item.name }));
    const not_in_stock = (
      await this.prisma.item.groupBy({
        by: ['model'],
        _count: true,
        where: { name: { equals: 'Не в учете' } },
      })
    ).map((item) => ({ in_stock: item._count, name: item.model }));
    const res = listed.map((itm) => ({
      ...in_stock.find((item) => item.name === itm.name),
      ...itm,
    }));

    return [...res, ...not_in_stock].sort((a, b) => (a.name < b.name ? -1 : 1));
  }

  async getLatestInventoryName(): Promise<{ upload_date: Date; name: string }> {
    const orderReccentFiles = (dir: string) => {
      return fs
        .readdirSync(dir)
        .filter((file) => fs.lstatSync(join(dir, file)).isFile())
        .map((file) => ({
          name: file,
          upload_date: fs.lstatSync(join(dir, file)).mtime,
        }))
        .sort((a, b) => b.upload_date.getTime() - a.upload_date.getTime());
    };

    const files = orderReccentFiles(
      join(__dirname, '..', '..', 'static', 'inventory'),
    );
    return files.length ? files[0] : undefined;
  }
}
