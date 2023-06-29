import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { File, Instruction } from '.prisma/client';
import { Request } from 'express';
import * as moment from 'moment';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileUploadDto, ResFileUploadDto } from './dto/file-upload.dto';
import {
  InstructionUploadDto,
  ResInstructionUploadDto,
} from './dto/instruction-upload.dto';
import { FileService } from './file.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@ApiTags('File')
@UseGuards(AuthGuard('jwt'))
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * Upload inventory to all items with `model`
   */
  @Post('instruction/*')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: InstructionUploadDto })
  @ApiResponse({ status: 201, type: ResInstructionUploadDto })
  @UseInterceptors(
    FileInterceptor('instruction', {
      storage: diskStorage({
        destination: './static',
        filename: (req, file, callback) => {
          const uniqueSuffix = `Инструкция ${
            req.params.model
          }-${moment().format('DD.MM.YYYY')}`;
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter(req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        cb(null, true);
      },
    }),
  )
  uploadInstruction(
    @Param() params: Record<string, string>,
    @UploadedFile() instruction: Express.Multer.File,
    @Req() { user }: Request,
  ): Promise<Instruction> {
    return this.fileService.uploadInstruction(
      instruction,
      Object.values(params)[0],
      user,
    );
  }

  /**
   * Upload files to specific QR
   */
  @Post(':qr')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({ status: 201, type: ResFileUploadDto, isArray: true })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './static',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${req.params.qr.padStart(5, '0')}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  uploadFiles(
    @Param('qr') qr: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() { user }: Request,
  ): Promise<File[]> {
    return this.fileService.uploadFiles(files, +qr, user);
  }

  /**
   * Delete instruction with `id`
   */
  @Delete('instruction/:id')
  @ApiResponse({ status: 200, type: ResInstructionUploadDto })
  deleteInscruction(@Param('id') id: string, @Req() { user }: Request) {
    return this.fileService.deleteInstruction(+id, user);
  }

  /**
   * Delete file with `id`
   */
  @Delete(':id')
  @ApiResponse({ status: 200, type: ResFileUploadDto })
  deleteFile(@Param('id') id: string, @Req() { user }: Request) {
    return this.fileService.deleteFile(+id, user);
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  // @Cron(CronExpression.EVERY_10_SECONDS)
  createDBDump() {
    return this.fileService.createDBDump();
  }
}
