import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber } from 'class-validator';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Date of the session',
    type: Date,
    example: '2025-01-21T10:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Time slot of the session',
    enum: TimeSlot,
    example: TimeSlot.SLOT_14_16,
  })
  @IsEnum(TimeSlot)
  timeSlot: TimeSlot;

  @ApiProperty({
    description: 'Room number where the session will take place',
    type: Number,
    example: 23,
  })
  @IsNumber()
  roomNumber: number;
}
