import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from './base-response.dto';

export class GenericResponseDto<T> extends BaseResponseDto {
  @ApiPropertyOptional()
  @IsOptional()
  data?: T;

  constructor(_message?: string, _data?: T) {
    super(_message);
    this.data = _data;
  }
}
