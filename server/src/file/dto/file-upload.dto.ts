import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    maxItems: 10,
  })
  files: any[];
}

export class ResFileUploadDto {
  id: number;
  name: string;
  created_at: Date;
  item_id: number | null;
  path: string;
}
