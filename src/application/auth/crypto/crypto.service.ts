import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONSTANTS } from '@application/common/constants';
import { createCipheriv, createDecipheriv, scryptSync } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly iv: Buffer;
  private readonly key: Buffer;
  private readonly algorithm = CONSTANTS.CRYPTO.ALGORITHM;

  constructor(private configService: ConfigService) {
    this.key = scryptSync(this.configService.get<string>('CRYPTO.SECRET'), this.configService.get<string>('CRYPTO.SALT'), 32);
    this.iv = Buffer.from(this.configService.get<string>('CRYPTO.IV'), 'hex');
  }

  async encrypt(payload: object): Promise<string> {
    const cipher = createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async decrypt(encryptedPayload: string): Promise<object> {
    const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedPayload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}
