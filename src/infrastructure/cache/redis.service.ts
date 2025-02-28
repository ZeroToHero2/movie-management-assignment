import Redis from 'ioredis';
import { parseValues } from './utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class RedisClientService {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.get<string>('REDIS_BASE_URL'), {
      connectTimeout: this.configService.get<number>('REDIS_CONNECTION_TIMEOUT'),
      maxRetriesPerRequest: this.configService.get<number>('REDIS_MAX_RETRIES_PER_REQUEST'),
      enableReadyCheck: this.configService.get<boolean>('REDIS_ENABLE_READY_CHECK'),
      retryStrategy: (times) => {
        if (times > this.configService.get<number>('REDIS_MAX_RETRIES_PER_REQUEST')) {
          return null;
        }
        return Math.min(
          times * this.configService.get<number>('REDIS_RETRY_DELAY'),
          this.configService.get<number>('REDIS_CONNECTION_TIMEOUT'),
        );
      },
    });
  }

  async getObject(key: string): Promise<any | null> {
    const value = await this.redis.get(key);
    if (value) return JSON.parse(value);
    return null;
  }

  async setObject<T>(key: string, value: T): Promise<boolean> {
    await this.redis.set(key, JSON.stringify(value));
    return true;
  }

  async setObjectWithTTL<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  }

  getString(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  setString(key: string, value: string): Promise<string | null> {
    return this.redis.set(key, value);
  }

  setStringWithTTL(key: string, value: string, ttlSeconds: number): Promise<string | null> {
    return this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async getNumber(key: string): Promise<number | null> {
    const value = await this.redis.get(key);
    if (value) {
      return parseInt(value, 10);
    }
    return null;
  }

  async getHashAll(key: string): Promise<any | null> {
    return parseValues(await this.redis.hgetall(key));
  }

  async getHash(key: string, field: string): Promise<any | null> {
    return this.redis.hget(key, field);
  }

  async getHashAllFields(key: string): Promise<any | null> {
    return this.redis.hgetall(key);
  }

  async setHash(key: string, field: string, value: string, expireSeconds?: number): Promise<boolean> {
    await this.redis.hset(key, field, value);
    if (expireSeconds) await this.expire(key, expireSeconds);
    return true;
  }

  async expire(key: string, expireSeconds: number) {
    return this.redis.expire(key, expireSeconds);
  }

  async remove(key: string): Promise<boolean> {
    const retVal = await this.redis.del(key);
    return retVal === 1;
  }

  async removeAll(): Promise<string> {
    return this.redis.flushall();
  }
}
