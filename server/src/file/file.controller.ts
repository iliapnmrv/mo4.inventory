import { File, Instruction } from '.prisma/client';
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

@ApiTags('File')
@UseGuards(AuthGuard('jwt'))
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * Upload inventory to all items with `model`
   */
  @Post('instruction/:model')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: InstructionUploadDto })
  @ApiResponse({ status: 201, type: ResInstructionUploadDto })
  @UseInterceptors(
    FileInterceptor('instruction', {
      storage: diskStorage({
        destination: './static',
        filename: (req, file, callback) => {
          const uniqueSuffix = `Инструкция ${req.params.model.replace(
            /[/\\?%*:|"<>]/g,
            '-',
          )}-${moment().format('DD.MM.YYYY HH-mm')}`;
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
    @Param('model') model: string,
    @UploadedFile() instruction: Express.Multer.File,
    @Req() { user }: Request,
  ): Promise<Instruction> {
    return this.fileService.uploadInstruction(instruction, model, user);
  }

  /**
   * Upload files to specific QR
   */
  @Post(':qr')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
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
  ): Promise<ResFileUploadDto[]> {
    return this.fileService.uploadFiles(files, +qr, user);
  }

  @Delete('instruction/:id')
  deleteInscruction(
    @Param('id') id: string,
    @Req() { user }: Request,
  ): Promise<ResInstructionUploadDto> {
    return this.fileService.deleteInstruction(+id, user);
  }

  @Delete(':id')
  deleteFile(
    @Param('id') id: string,
    @Req() { user }: Request,
  ): Promise<ResFileUploadDto> {
    return this.fileService.deleteFile(+id, user);
  }
}
