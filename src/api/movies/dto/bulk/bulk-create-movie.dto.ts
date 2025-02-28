import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMovieDto } from '../create-movie.dto';
import { ArrayUnique, IsArray, ValidateNested } from 'class-validator';

export class BulkCreateMovieDto {
  @ApiProperty({ type: [CreateMovieDto] })
  @IsArray()
  @ArrayUnique((movie) => movie.name, {
    message: 'Movie names must be unique',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateMovieDto)
  movies: CreateMovieDto[];
}
