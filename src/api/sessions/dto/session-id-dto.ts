import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SessionIdDto {
  @ApiProperty({
    description: 'The unique identifier of the session',
    example: 'k456e456-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  sessionId: string;
}
