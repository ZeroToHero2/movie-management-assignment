import { Role } from '@domain/auth/enums/role.enum';
import { DeepPartial, FindOneOptions } from 'typeorm';
import { UserEntity } from '@domain/users/entities/user.entity';

export const UserRepositoryToken = Symbol('IUserRepository');

export interface IUserRepository {
  create(user: DeepPartial<UserEntity>): UserEntity;
  save(user: UserEntity): Promise<UserEntity>;
  findOne(options: FindOneOptions<UserEntity>): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByEmailWithPassword(email: string): Promise<UserEntity | null>;
  findByRole(role: Role): Promise<UserEntity[]>;
}
