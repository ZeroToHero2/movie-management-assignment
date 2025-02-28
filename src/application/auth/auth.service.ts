import * as bcrypt from 'bcrypt';
import { SignupDto } from '@api/auth/dto';
import { Injectable } from '@nestjs/common';
import { LoginDto } from '@api/auth/dto/login.dto';
import { JwtService } from '@application/auth/jwt/jwt.service';
import { UserEntity } from '@domain/users/entities/user.entity';
import { UsersService } from '@application/users/users.service';
import { CryptoService } from '@application/auth/crypto/crypto.service';
import { UserAlreadyExistsError, UserNotAuthorizedError } from '@domain/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    const isPasswordsMatch = await bcrypt.compare(password, user.password);
    if (user && isPasswordsMatch) {
      //? Sanitize the password from the response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    throw new UserNotAuthorizedError();
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const cipherText = await this.encrpytUserClaims(user);

    return {
      access_token: await this.jwtService.signAsync(cipherText),
    };
  }

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const user = await this.usersService.createUser(signupDto);
    const cipherText = await this.encrpytUserClaims(user);

    return {
      access_token: await this.jwtService.signAsync(cipherText),
      user,
    };
  }

  async encrpytUserClaims(user: UserEntity) {
    const payload = { id: user.id, sub: user.id, email: user.email, age: user.age, role: user.role };
    return this.cryptoService.encrypt(payload);
  }
}
