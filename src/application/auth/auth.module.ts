import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@api/auth/auth.controller';
import { JwtModule } from '@application/auth/jwt/jwt.module';
import { AuthService } from '@application/auth/auth.service';
import { UsersModule } from '@application/users/users.module';
import { CryptoModule } from '@application/auth/crypto/crypto.module';
import { JwtStrategy } from '@application/auth/strategies/jwt.strategy';
import { LocalStrategy } from '@application/auth/strategies/local.strategy';

@Module({
  imports: [JwtModule, UsersModule, CryptoModule, PassportModule],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, CryptoModule],
})
export class AuthModule {}
