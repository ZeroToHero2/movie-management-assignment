import { plainToClass } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString() PORT: string;

  @IsString() NODE_ENV: string;

  @IsString() LOG_LEVEL: string;

  @IsString() DATABASE_URL: string;

  @IsString() REDIS_URL: string;

  @IsString() RABBITMQ_URL: string;

  @IsString() JWT_SECRET: string;

  @IsString() JWT_EXPIRATION_TIME: string;

  @IsString() CRYPTO_IV: string;

  @IsString() CRYPTO_SALT: string;

  @IsString() CRYPTO_SECRET: string;

  @IsString() INITIAL_MANAGER_EMAIL: string;

  @IsString() INITIAL_MANAGER_USERNAME: string;

  @IsString() INITIAL_MANAGER_PASSWORD: string;

  @IsString() INITIAL_USER_EMAIL: string;

  @IsString() INITIAL_USER_USERNAME: string;

  @IsString() INITIAL_USER_PASSWORD: string;

  @IsString() SENDGRID_API_KEY: string;

  @IsString() SENDGRID_SINGLE_SENDER_EMAIL: string;
}

export default function validate(configuration: Record<string, unknown>) {
  const finalConfig = plainToClass(EnvironmentVariables, configuration, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(finalConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment Variables Validation Error: ${errors.toString()}`);
  }

  return finalConfig;
}
