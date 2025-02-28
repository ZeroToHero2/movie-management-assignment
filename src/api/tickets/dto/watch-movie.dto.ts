import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WatchMovieDto {
  @ApiProperty({ example: '4s56e456-e89b-12d3-a456-426614174000' })
  @IsString()
  ticketId: string;
}
