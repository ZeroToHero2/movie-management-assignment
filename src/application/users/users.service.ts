import { FindOneOptions } from 'typeorm';
import { SignupDto } from '@api/auth/dto';
import { Role } from '@domain/auth/enums/role.enum';
import { Injectable, Inject } from '@nestjs/common';
import { UserNotFoundError } from '@domain/exceptions';
import { UserEntity } from '@domain/users/entities/user.entity';
import { IUserRepository, UserRepositoryToken } from '@domain/users/repositories/user-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly usersRepository: IUserRepository,
  ) {}

  async findOne(options: FindOneOptions<UserEntity>): Promise<UserEntity | undefined> {
    const user = await this.usersRepository.findOne(options);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async findById(id: string): Promise<UserEntity | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return this.usersRepository.findByEmail(email);
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | undefined> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async findByRole(role: Role): Promise<UserEntity[]> {
    return this.usersRepository.findByRole(role);
  }

  async createUser(signupDto: SignupDto): Promise<UserEntity> {
    const user = await SignupDto.toEntity(signupDto);
    return this.usersRepository.save(user);
  }
}
