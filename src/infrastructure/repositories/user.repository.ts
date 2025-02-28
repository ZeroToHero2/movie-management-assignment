import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@domain/auth/enums/role.enum';
import { UserEntity } from '@domain/users/entities/user.entity';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { IUserRepository } from '@domain/users/repositories/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  create(user: DeepPartial<UserEntity>): UserEntity {
    return this.repository.create(user);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return this.repository.save(user);
  }

  async findOne(options: FindOneOptions<UserEntity>): Promise<UserEntity | null> {
    return this.repository.findOne(options);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: { tickets: true },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password', 'role', 'age'],
    });
  }

  async findByRole(role: Role): Promise<UserEntity[]> {
    return this.repository.find({ where: { role } });
  }
}
