import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateSessionDto } from '../../sessions/dto/update-session-dto';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateMovieDto {
  @ApiPropertyOptional({ example: 'Updated Example Movie' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  ageRestriction?: number;

  @ApiPropertyOptional({ type: [UpdateSessionDto] })
  @IsOptional()
  @IsArray()
  @Type(() => UpdateSessionDto)
  @ValidateNested({ each: true })
  sessions?: UpdateSessionDto[];
}
