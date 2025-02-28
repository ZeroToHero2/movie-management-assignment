import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class BulkDeleteMovieDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  movieIds: string[];
}
