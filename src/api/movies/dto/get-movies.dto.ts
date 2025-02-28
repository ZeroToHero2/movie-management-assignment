import { Type } from 'class-transformer';
import { Sort } from '@application/common/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ComparisonSymbols } from '@application/common/enums/comparisan-symbols.enum';
import { IsOptional, IsString, IsEnum, IsInt, Min, IsIn, ValidateIf } from 'class-validator';

export class GetMoviesDto {
  @ApiPropertyOptional({
    description: 'Filter by movie name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by age restriction',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @ValidateIf((o) => o.ageRestriction !== undefined || o.ageRestrictionCondition !== undefined)
  ageRestriction?: number;

  @ApiPropertyOptional({
    description: 'Comparison symbol for age restriction filtering',
    enum: ComparisonSymbols,
    type: String,
  })
  @IsEnum(ComparisonSymbols)
  @ValidateIf((o) => o.ageRestriction !== undefined || o.ageRestrictionCondition !== undefined)
  ageRestrictionComparisonSymbol?: ComparisonSymbols;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    type: String,
  })
  @IsOptional()
  @IsIn(['name', 'ageRestriction', 'createdAt', 'updatedAt'])
  sortBy: string = 'name';

  @ApiPropertyOptional({
    description: `Order to sort the results by ${Sort.ASC} or ${Sort.DESC}`,
    enum: Sort,
  })
  @IsOptional()
  @IsEnum(Sort)
  sortOrder: Sort = Sort.ASC;
}
