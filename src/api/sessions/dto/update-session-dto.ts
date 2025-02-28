import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber } from 'class-validator';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';

export class UpdateSessionDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ enum: TimeSlot, description: 'Time slot of the session', example: TimeSlot.SLOT_14_16 })
  @IsEnum(TimeSlot)
  timeSlot: TimeSlot;

  @ApiProperty({ example: 5, description: 'Room number of the session' })
  @IsNumber()
  roomNumber: number;
}
