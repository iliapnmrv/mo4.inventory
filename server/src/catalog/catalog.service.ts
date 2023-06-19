import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { Catalogs } from './catalog.controller';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async create(catalog: Catalogs, createCatalogDto: CreateCatalogDto) {
    //@ts-ignore
    return await this.prisma[catalog].create({
      data: { ...createCatalogDto },
    });
  }

  async findAll(q?: string) {
    const select = {
      select: { id: true, name: true },
      orderBy: { name: 'asc' as const },
      where: { name: { contains: q } },
    };

    return {
      person: await this.prisma.person.findMany(select),
      status: await this.prisma.status.findMany(select),
      user: await this.prisma.user.findMany(select),
      place: await this.prisma.place.findMany(select),
      device: await this.prisma.device.findMany(select),
      type: await this.prisma.type.findMany(select),
      stock_device: await this.prisma.stock_device.findMany(select),
    };
  }

  async findOne(catalog: Catalogs) {
    //@ts-ignore
    return await this.prisma[catalog].findMany();
  }

  async findAvailableToDelete(catalog: Catalogs, id: number) {
    //@ts-ignore
    const catalogToDelete = await this.prisma[catalog].findFirst({
      where: { id },
      include: { items: true },
    });
    if (!catalogToDelete.items.length) {
      return { available: true };
    }
    return { available: false, data: catalogToDelete.items };
  }

  async update(
    catalog: Catalogs,
    id: number,
    updateCatalogDto: UpdateCatalogDto,
  ) {
    //@ts-ignore
    return await this.prisma[catalog].update({
      where: { id },
      data: { ...updateCatalogDto },
    });
  }

  async remove(catalog: Catalogs, id: number) {
    //@ts-ignore
    const catalogToDelete = await this.prisma[catalog].findFirst({
      where: { id },
      include: { items: true },
    });
    if (catalogToDelete.items.length) {
      throw new HttpException(
        `Нельзя удалить, каталог занят позициями c qr: ${catalogToDelete.items
          .map((item) => item.qr)
          .join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    //@ts-ignore
    return await this.prisma[catalog].delete({ where: { id } });
  }
}
