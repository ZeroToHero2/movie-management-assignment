import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MovieIdDto {
  @ApiProperty({
    description: 'The unique identifier of the movie',
    example: 'b5d2b68e-8a0d-4a2f-53d7-62cfcc14',
  })
  @IsUUID()
  movieId: string;
}
