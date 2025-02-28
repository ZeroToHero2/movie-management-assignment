import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'manager@test.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'example-password', description: 'The password of the user' })
  @IsString()
  password: string;
}
