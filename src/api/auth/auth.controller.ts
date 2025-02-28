import { LoginDto, SignupDto } from '@api/auth/dto';
import { Role } from '@domain/auth/enums/role.enum';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@application/auth/auth.service';
import { Public, Roles } from '@application/common/decorators';
import { UserEntity } from '@domain/users/entities/user.entity';
import { GenericResponseDto } from '@api/common/dto/generic-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 201, description: 'User Has Been Successfully Logged In!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async login(@Body() loginDto: LoginDto): Promise<GenericResponseDto<{ access_token: string }>> {
    const token = await this.authService.login(loginDto);
    return new GenericResponseDto('User Has Been Successfully Logged In!', token);
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'User Signup' })
  @ApiResponse({ status: 201, description: 'The User Has Been Successfully Created!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async signup(@Body() signupDto: SignupDto): Promise<GenericResponseDto<{ access_token: string; user: UserEntity }>> {
    signupDto.role = Role.CUSTOMER; //? Set the role to CUSTOMER
    const user = await this.authService.signup(signupDto);
    return new GenericResponseDto('User Has Been Successfully Created!', user);
  }

  @Post('manager')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create a new manager' })
  @ApiResponse({ status: 201, description: 'The Manager Has Been Successfully Created!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async registerManager(@Body() signupDto: SignupDto): Promise<GenericResponseDto<{ access_token: string; user: UserEntity }>> {
    signupDto.role = Role.MANAGER; //? Set the role to MANAGER
    const manager = await this.authService.signup(signupDto);
    return new GenericResponseDto('Manager Has Been Successfully Created!', manager);
  }
}
