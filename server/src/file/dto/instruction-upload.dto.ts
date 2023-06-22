import { ApiProperty } from '@nestjs/swagger';
import { Instruction } from '.prisma/client';

export class InstructionUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  instruction: any;
}

export class ResInstructionUploadDto {
  id: number;
  name: string;
  path: string;
  created_at: Date;
}
