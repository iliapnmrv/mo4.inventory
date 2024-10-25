import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Query, SuggestionQuery } from './item.controller';
import { TokenPayload } from 'src/types/types';
import { Catalogs, itemNames } from 'src/utils/itemNames';
import { CatalogService } from 'src/catalog/catalog.service';
import * as XLSX from 'xlsx';
import * as path from 'path';
import {
  Device,
  Inventory,
  Item,
  Person,
  Place,
  Status,
  Type,
  User,
} from '.prisma/client';
import { removeEmptyValuesFromObject } from 'src/utils/utils';
import * as moment from 'moment';

@Injectable()
export class ItemService {
  constructor(
    private prisma: PrismaService,
    private catalogService: CatalogService,
  ) {}

  async create(createItemDto: CreateItemDto, user: TokenPayload) {
    const exists = await this.prisma.item.count({
      where: { qr: createItemDto.qr },
    });
    if (exists) {
      throw new HttpException(
        'Такой QR код уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const similarItem = await this.prisma.item.findFirst({
      where: { model: createItemDto.model },
      include: { stock_items: true },
    });

    const item = await this.prisma.item.create({
      //@ts-ignore
      data: {
        ...createItemDto,
        instruction_id: similarItem?.instruction_id,
        stock_items: {
          connect: similarItem?.stock_items?.map(({ id }) => ({ id })),
        },
      },
      include: {
        logs: true,
        status: true,
        device: true,
        user: true,
        person: true,
        place: true,
        type: true,
      },
    });

    await this.prisma.log.create({
      data: {
        description: 'Позиция создана',
        item_qr: item.qr,
        author: user.fio,
      },
    });

    return item;
  }

  async findAll({
    q,
    include = false,
    includeLogs = false,
    sortBy = 'qr',
    direction = 'desc',
    showArchive,
    offset = 0,
    limit = 20,
    showZeroCartridges,
    stock_item,
    ...params
  }: Query) {
    Object.keys(params).map((el) => {
      params[el] = {
        in: params[el].split(',').map(Number),
      };
    });

    const { status_id } = await this.archiveIds();

    const q_catalogs = await this.catalogService.findAll(q);

    return {
      data: await this.prisma.item.findMany({
        orderBy: { ...(sortBy && { [sortBy]: direction }) },
        include: {
          logs: includeLogs,
          status: include,
          device: include,
          user: include,
          person: include,
          place: include,
          type: include,
        },
        skip: +offset,
        take: +limit,
        //@ts-ignore
        where: {
          ...params,
          ...((showZeroCartridges === 'true' || stock_item) && {
            stock_items: {
              some: {
                ...(showZeroCartridges === 'true' && {
                  device_id: 1,
                  quantity: { equals: 0 },
                }),
                ...(stock_item && { id: +stock_item }),
              },
            },
          }),
          NOT: {
            //@ts-ignore
            ...(!params?.status_id?.in?.includes?.(status_id) &&
              showArchive !== 'true' && {
                status_id,
              }),
          },
          ...(q && {
            OR: [
              { ...(!isNaN(+q) && { qr: { in: +q } }) },
              { name: { contains: q } },
              { model: { contains: q } },
              { serial_number: { contains: q } },
              { additional_information: { contains: q } },
              { description: { contains: q } },
              {
                status_id: {
                  in: q_catalogs.status.map((status) => status.id),
                },
              },
              {
                user_id: { in: q_catalogs.user.map((status) => status.id) },
              },
              {
                type_id: { in: q_catalogs.type.map((status) => status.id) },
              },
              {
                place_id: {
                  in: q_catalogs.place.map((status) => status.id),
                },
              },
              {
                person_id: {
                  in: q_catalogs.person.map((status) => status.id),
                },
              },
              {
                device_id: {
                  in: q_catalogs.device.map((status) => status.id),
                },
              },
            ],
          }),
        },
      }),

      meta: {
        total: await this.prisma.item.count({
          //@ts-ignore
          where: {
            ...params,
            ...((showZeroCartridges === 'true' || stock_item) && {
              stock_items: {
                some: {
                  ...(showZeroCartridges === 'true' && {
                    device_id: 1,
                    quantity: { equals: 0 },
                  }),
                  ...(stock_item && { id: +stock_item }),
                },
              },
            }),
            NOT: {
              //@ts-ignore
              ...(!params?.status_id?.in?.includes?.(status_id) &&
                showArchive !== 'true' && {
                  status_id,
                }),
            },
            ...(q && {
              OR: [
                { ...(!isNaN(+q) && { qr: { in: +q } }) },
                { name: { contains: q } },
                { model: { contains: q } },
                { serial_number: { contains: q } },
                { additional_information: { contains: q } },
                { description: { contains: q } },
                {
                  status_id: {
                    in: q_catalogs.status.map((status) => status.id),
                  },
                },
                {
                  user_id: { in: q_catalogs.user.map((status) => status.id) },
                },
                {
                  type_id: { in: q_catalogs.type.map((status) => status.id) },
                },
                {
                  place_id: {
                    in: q_catalogs.place.map((status) => status.id),
                  },
                },
                {
                  person_id: {
                    in: q_catalogs.person.map((status) => status.id),
                  },
                },
                {
                  device_id: {
                    in: q_catalogs.device.map((status) => status.id),
                  },
                },
              ],
            }),
          },
        }),
      },
    };
  }

  async findSuggestions({ q, field }: SuggestionQuery) {
    if (field) {
      return await this.prisma.item.findMany({
        take: 10,
        where: {
          qr: !isNaN(+q) ? { in: +q } : 0,
        },
      });
    } else {
      return await this.prisma.item.findMany({
        take: 10,
        where: {
          OR: [
            !isNaN(+q) ? { qr: { in: +q } } : undefined,
            { name: { contains: q } },
            { model: { contains: q } },
            { serial_number: { contains: q } },
            { additional_information: { contains: q } },
            { description: { contains: q } },
          ],
        },
      });
    }
  }

  async findUniqueNames() {
    return await this.prisma.item.findMany({
      distinct: 'name',
      select: { name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findLastQR(): Promise<number> {
    return (await this.prisma.item.findFirst({ orderBy: { qr: 'desc' } })).qr;
  }

  async findSerialNumberAvailable(serial_number: string) {
    const exists = await this.prisma.item.findFirst({
      where: { serial_number },
    });
    if (exists) {
      throw new HttpException(
        'Серийный номер используется',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { exists: false };
  }

  async findOne(qr: number) {
    const item = await this.prisma.item.findUnique({
      where: { qr },
      include: {
        logs: true,
        instruction: true,
        status: true,
        device: true,
        user: true,
        person: true,
        place: true,
        type: true,
        files: true,
        stock_items: true,
      },
    });

    const { status_id } = await this.archiveIds();

    return {
      ...item,
      analysis: {
        listed: (
          await this.prisma.inventory.aggregate({
            where: { name: item.name },
            _sum: { kolvo: true },
          })
        )._sum.kolvo,
        in_stock:
          item.name === 'Не в учете'
            ? await this.prisma.item.count({
                where: { model: item.model, status_id: { not: status_id } },
              })
            : await this.prisma.item.count({
                where: { name: item.name, status_id: { not: status_id } },
              }),
      },
    };
  }

  async update(qr: number, updateItemDto: UpdateItemDto, user: TokenPayload) {
    const prev = await this.prisma.item.findFirst({ where: { qr } });
    if (!prev) {
      throw new HttpException(
        'Такого кода не существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const similarItem = await this.prisma.item.findFirst({
      where: { model: updateItemDto.model },
      include: { stock_items: true },
    });

    const updated = await this.prisma.item.update({
      where: { qr },
      //@ts-ignore
      data: {
        ...updateItemDto,
        updatedAt: new Date(),
        checked_at: updateItemDto.checked_at
          ? moment(updateItemDto.checked_at).toDate()
          : prev.checked_at,
        instruction_id: similarItem?.instruction_id,
        stock_items: {
          connect: similarItem?.stock_items?.map(({ id }) => ({ id })),
        },
      },
      // include: { logs: true, files: true },
    });

    delete updated.createdAt;
    delete updated.updatedAt;
    delete updated.instruction_id;
    delete updated.checked_at;
    delete updated.last_found_at;

    const differencesKeys = Object.keys(updated).filter(
      (key) => updated[key] !== prev[key],
    );

    const catalogs = await this.catalogService.findAll();

    if (differencesKeys.length) {
      await this.prisma.log.create({
        data: {
          description: differencesKeys
            .map((key) => {
              if (key in Catalogs) {
                return `${itemNames[key]}: ${
                  catalogs[Catalogs[key]].find((item) => item.id === prev[key])
                    .name
                } -> ${
                  catalogs[Catalogs[key]].find(
                    (item) => item.id === updated[key],
                  ).name
                };`;
              }
              return `${itemNames[key]}: ${prev[key]} -> ${updated[key]};`;
            })
            .join(' '),
          item_qr: updated.qr,
          author: user.fio,
        },
      });
    }

    return updated;
  }

  async updateMany(
    qrs: string,
    updateItemDto: UpdateItemDto,
    user: TokenPayload,
  ) {
    const results: number[] = await Promise.all(
      qrs.split(',').map(async (qr): Promise<any> => {
        const prev = await this.prisma.item.findFirst({ where: { qr: +qr } });
        const updated = await this.prisma.item.update({
          where: { qr: +qr },
          data: {
            ...removeEmptyValuesFromObject(updateItemDto),
            updatedAt: new Date(),
          },
        });

        delete updated.createdAt;
        delete updated.updatedAt;
        delete updated.instruction_id;

        const differencesKeys = Object.keys(updated).filter(
          (key) => updated[key] !== prev[key],
        );

        const catalogs = await this.catalogService.findAll();

        await this.prisma.log.create({
          data: {
            description: differencesKeys
              .map((key) => {
                if (key in Catalogs) {
                  return `${itemNames[key]}: ${
                    catalogs[Catalogs[key]].find(
                      (item) => item.id === prev[key],
                    ).name
                  } -> ${
                    catalogs[Catalogs[key]].find(
                      (item) => item.id === updated[key],
                    ).name
                  };`;
                }
                return `${itemNames[key]}: ${prev[key]} -> ${updated[key]};`;
              })
              .join(' '),
            item_qr: updated.qr,
            author: user.fio,
          },
        });
      }),
    );

    return results;
  }

  async remove(qr: number, user: TokenPayload) {
    return await this.prisma.item.delete({ where: { qr } });
  }

  async moveToArchive(qr: number, user: TokenPayload) {
    const { place_id, status_id, user_id } = await this.archiveIds();

    const prevItem = await this.prisma.item.findFirst({
      where: { qr },
      include: { status: true, user: true, place: true },
    });

    await this.prisma.item.update({
      where: { qr },
      data: { status_id, place_id, user_id },
    });
    await this.prisma.log.create({
      data: {
        description: `Позиция перемещена в архив. Пользователь: ${prevItem.user.name}, Местоположение: ${prevItem.place.name}, Статус: ${prevItem.status.name}`,
        item_qr: qr,
        author: user.fio,
      },
    });
    return;
  }

  async archiveIds(): Promise<{
    status_id: number;
    place_id: number;
    user_id: number;
  }> {
    const archiveSearchRule = { contains: 'Архив' };

    const place_id = (
      await this.prisma.place.findFirst({
        where: { name: archiveSearchRule },
      })
    )?.id;
    const status_id = (
      await this.prisma.status.findFirst({
        where: { name: archiveSearchRule },
      })
    )?.id;
    const user_id = (
      await this.prisma.user.findFirst({
        where: { name: archiveSearchRule },
      })
    )?.id;

    return { status_id, place_id, user_id };
  }

  async export({
    q,
    sortBy = 'qr',
    direction = 'asc',
    showArchive,
    include = false,
    showZeroCartridges,
    stock_item,
    ...params
  }: Query): Promise<{
    file: string;
    tables: {
      items: (Item & {
        device: Device;
        person: Person;
        status: Status;
        place: Place;
        user: User;
        type: Type;
      })[];
      inventory: Inventory[];
    };
  }> {
    const items = await this.prisma.item.findMany({
      include: {
        device: true,
        person: true,
        status: true,
        place: true,
        user: true,
        type: true,
      },
    });

    Object.keys(params).map((el) => {
      params[el] = {
        in: params[el].split(',').map(Number),
      };
    });

    const { status_id } = await this.archiveIds();

    const databaseData = {
      Документооборот: (
        await this.prisma.item.findMany({
          include: {
            device: { select: { name: true } },
            person: { select: { name: true } },
            status: { select: { name: true } },
            place: { select: { name: true } },
            user: { select: { name: true } },
            type: { select: { name: true } },
          },
          orderBy: sortBy ? [{ [sortBy]: direction }] : [],
          //@ts-ignore
          where: {
            ...params,
            ...((showZeroCartridges === 'true' || stock_item) && {
              stock_items: {
                some: {
                  ...(showZeroCartridges === 'true' && {
                    device_id: 1,
                    quantity: { equals: 0 },
                  }),
                  ...(stock_item && { id: +stock_item }),
                },
              },
            }),
            NOT: {
              //@ts-ignore
              ...(!params?.status_id?.in?.includes?.(status_id) &&
                showArchive !== 'true' && {
                  status_id,
                }),
            },
            ...(q && {
              OR: [
                { ...(!isNaN(+q) && { qr: { in: +q } }) },
                { name: { contains: q } },
                { model: { contains: q } },
                { serial_number: { contains: q } },
                { additional_information: { contains: q } },
                { description: { contains: q } },
              ],
            }),
          },
        })
      ).map((item) => {
        return {
          ...item,
          //@ts-ignore
          device: item.device.name,
          //@ts-ignore
          place: item.place.name,
          //@ts-ignore
          user: item.user.name,
          //@ts-ignore
          type: item.type.name,
          //@ts-ignore
          status: item.status.name,
          //@ts-ignore
          person: item.person.name,
        };
      }),
      Инвентаризация: await this.prisma.inventory.findMany(),
      МОЛы: await this.prisma.person.findMany(),
      Статусы: await this.prisma.status.findMany(),
      Номенкулатура: await this.prisma.type.findMany(),
      'Типы устройств': await this.prisma.device.findMany(),
      Местоположения: await this.prisma.place.findMany(),
      Пользователи: await this.prisma.user.findMany(),
      Журнал: await this.prisma.log.findMany(),
      Склад: await this.prisma.stock.findMany(),
      'Устройства (склад)': await this.prisma.stock_device.findMany(),
      'Журнал (склад)': await this.prisma.stock_log.findMany(),
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
    const fileName = `Инвентаризация ${day}.${String(month + 1).padStart(
      2,
      '0',
    )}.${year}.xlsx`;

    const filePath = path.join(__dirname, '..', '..', 'static', fileName);

    XLSX.writeFileXLSX(wb, filePath, {
      type: 'file',
    });

    return {
      file: fileName,
      tables: { items, inventory: databaseData['Инвентаризация'] },
    };
  }

  async addStock(model: string, stockId: number, user: TokenPayload) {
    const items = await this.prisma.item.findMany({
      where: { model },
      select: { qr: true },
    });

    const stock = await this.prisma.stock.update({
      where: { id: stockId },
      data: { items: { connect: items } },
    });

    return await Promise.all(
      items.map(
        async (item) =>
          await this.prisma.log.create({
            data: {
              item_qr: item.qr,
              author: user.fio,
              description: `${stock.name} добавлено к модели ${model}`,
            },
          }),
      ),
    );
  }

  async removeStock(model: string, stockId: number, user: TokenPayload) {
    const items = await this.prisma.item.findMany({
      where: { model },
      select: { qr: true },
    });

    const stock = await this.prisma.stock.update({
      where: { id: stockId },
      data: { items: { disconnect: items } },
    });

    return await Promise.all(
      items?.map(
        async (item) =>
          await this.prisma.log.create({
            data: {
              item_qr: item.qr,
              author: user.fio,
              description: `${stock.name} удалено из модели ${model}`,
            },
          }),
      ),
    );
  }
}
