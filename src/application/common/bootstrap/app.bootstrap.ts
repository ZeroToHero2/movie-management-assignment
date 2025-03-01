import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@domain/auth/enums/role.enum';
import { UsersService } from '@application/users/users.service';

@Injectable()
export class BootstrapAppService {
  private readonly logger = new Logger(BootstrapAppService.name);
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Bootstrapping app with initial data...');
    const existingManagers = await this.userService.findByRole(Role.MANAGER);
    if (existingManagers.length === 0) {
      const manager = await this.userService.createUser({
        email: this.configService.get('INITIAL_MANAGER_EMAIL'),
        username: this.configService.get('INITIAL_MANAGER_USERNAME'),
        password: this.configService.get('INITIAL_MANAGER_PASSWORD'),
        age: 25,
        role: Role.MANAGER,
      });
      this.logger.log(
        'Manager created:',
        JSON.stringify({ id: manager.id, email: manager.email, username: manager.username, age: manager.age, role: manager.role }),
      );
    }
    const existingUsers = await this.userService.findByRole(Role.CUSTOMER);

    if (existingUsers.length === 0) {
      const users = await this.userService.createUser({
        email: this.configService.get('INITIAL_USER_EMAIL'),
        username: this.configService.get('INITIAL_USER_USERNAME'),
        password: this.configService.get('INITIAL_USER_PASSWORD'),
        age: 20,
        role: Role.CUSTOMER,
      });
      this.logger.log(
        'Users created:',
        JSON.stringify({ id: users.id, email: users.email, username: users.username, age: users.age, role: users.role }),
      );
    }

    this.logger.log('App bootstrap completed successfully!');
  }
}
