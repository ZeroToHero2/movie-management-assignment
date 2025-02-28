import * as bcrypt from 'bcrypt';
import { Role } from '@domain/auth/enums/role.enum';
import { IsEmail, IsInt, IsString } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@domain/users/entities/user.entity';

export class SignupDto {
  @ApiProperty({ example: 'Bahadır Ünal', description: 'The username of the user' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'new-user@test.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'example-password', description: 'The password of the user' })
  @IsString()
  password: string;

  @ApiProperty({ example: 15, description: 'The age of the user' })
  @IsInt()
  age: number;

  @ApiHideProperty()
  role: Role;

  static async toEntity(signupDto: SignupDto): Promise<UserEntity> {
    const user = new UserEntity();
    user.username = signupDto.username;
    user.email = signupDto.email;
    user.password = await bcrypt.hash(signupDto.password, 10);
    user.age = signupDto.age;
    user.role = signupDto.role;
    return user;
  }
}
