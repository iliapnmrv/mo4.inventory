import { File, Instruction } from '.prisma/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { TokenPayload } from 'src/types/types';

@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    protected configService: ConfigService,
  ) {}

  async uploadFiles(
    files: Express.Multer.File[],
    qr: number,
    user: TokenPayload,
  ): Promise<File[]> {
    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const uploadedFile = await this.prisma.file.create({
            data: { name: file.filename, path: file.filename },
          });
          await this.prisma.log.create({
            data: {
              description: `Загружен файл ${file.filename}`,
              item_qr: qr,
              author: user.fio,
            },
          });

          return uploadedFile;
        }),
      );
      const existingFiles = await this.prisma.file.findMany({
        where: { item: { qr } },
      });

      await this.prisma.item.update({
        where: { qr },
        data: {
          files: {
            set: [
              ...existingFiles.map((file) => ({ id: file.id })),
              ...uploadedFiles.map((file) => ({ id: file.id })),
            ],
          },
        },
      });
      return [...existingFiles, ...uploadedFiles];
    } catch (e) {
      console.log(e);

      throw new HttpException(
        'Ошибка при создании файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadInstruction(
    file: Express.Multer.File,
    model: string,
    user: TokenPayload,
  ): Promise<Instruction> {
    const instruction = await this.prisma.instruction.create({
      data: {
        name: file.originalname,
        path: file.filename,
      },
    });

    await this.prisma.item.updateMany({
      where: { model },
      data: { instruction_id: instruction.id },
    });

    const items = await this.prisma.item.findMany({
      where: { instruction_id: instruction.id },
    });

    await this.prisma.log.createMany({
      data: items.map((item) => ({
        description: `Загружена инструкция ${instruction.name}`,
        item_qr: item.qr,
        author: user.fio,
      })),
    });

    return instruction;
  }

  async deleteFile(id: number, user: TokenPayload) {
    const file = await this.prisma.file.delete({ where: { id } });
    const item = await this.prisma.item.findFirst({
      where: { id: file.item_id },
    });
    await this.prisma.log.create({
      data: {
        description: `Удален файл ${file.name}`,
        item_qr: item.qr,
        author: user.fio,
      },
    });

    return file;
  }
  async deleteInstruction(id: number, user: TokenPayload) {
    const items = await this.prisma.item.findMany({
      where: { instruction_id: id },
    });

    const instruction = await this.prisma.instruction.delete({ where: { id } });

    await this.prisma.log.createMany({
      data: items.map((item) => ({
        description: `Удалена инструкция ${instruction.name}`,
        item_qr: item.qr,
        author: user.fio,
      })),
    });
    return instruction;
  }
}
