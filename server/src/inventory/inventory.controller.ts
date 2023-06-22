import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { InventoryService } from './inventory.service';
import { ImportInventoryReportDto } from './dto/import-inventory-report.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('inventory', {
      storage: diskStorage({
        destination: './static/inventory',
        filename: (req, file, callback) => {
          callback(null, file.originalname);
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
  upload(@UploadedFile() inventory: Express.Multer.File) {
    return this.inventoryService.upload(inventory);
  }

  @Post('import-report')
  importReport(@Body() importInventory: ImportInventoryReportDto) {
    return this.inventoryService.importReport(importInventory);
  }

  @Get('report')
  findReport() {
    return this.inventoryService.findReport();
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('analysis')
  analyzeAll() {
    return this.inventoryService.analyzeAll();
  }

  @Get('latest')
  getLatestInventoryName() {
    return this.inventoryService.getLatestInventoryName();
  }
}
