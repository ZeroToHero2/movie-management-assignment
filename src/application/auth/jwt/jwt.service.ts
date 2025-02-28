import { Injectable } from '@nestjs/common';
import { CONSTANTS } from '@application/common/constants';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  private readonly userClaimsKey = CONSTANTS.JWT.CLAIMS_KEY;
  constructor(private readonly jwtService: NestJwtService) {}

  async signAsync(payload: string): Promise<string> {
    return this.jwtService.signAsync({ [this.userClaimsKey]: payload });
  }

  async verifyAsync(token: string): Promise<string> {
    const decoded = await this.jwtService.verifyAsync(token);
    return decoded[this.userClaimsKey];
  }
}
