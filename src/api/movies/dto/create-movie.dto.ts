import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSessionDto } from '../../sessions/dto/create-session.dto';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'Example Movie', description: 'The name of the movie' })
  @IsString()
  name: string;

  @ApiProperty({ example: 16, description: 'The age restriction of the movie' })
  @IsInt()
  ageRestriction: number;

  @ApiPropertyOptional({ type: [CreateSessionDto], description: 'The sessions of the movie' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSessionDto)
  sessions: CreateSessionDto[];
}
