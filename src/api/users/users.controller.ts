import { Controller, Get } from '@nestjs/common';
import { UsersService } from '@application/users/users.service';
import { UserEntity } from '@domain/users/entities/user.entity';
import { User } from '@application/common/decorators/user.decorator';
import { GenericResponseDto } from '@api/common/dto/generic-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WatchHistoryService } from '@application/watch-history/watch-history.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly watchHistoryService: WatchHistoryService,
  ) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the Authenticated User Profile' })
  @ApiResponse({ status: 200, description: 'The User Profile Has Been Successfully Retrieved!' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserProfile(@User() user: UserEntity) {
    const userProfile = await this.usersService.findById(user.id);
    return new GenericResponseDto('The User Profile Has Been Successfully Retrieved!', userProfile);
  }

  @Get('watch-history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the Watch History of the User' })
  @ApiResponse({ status: 200, description: 'The Users Watch History Has Been Successfully Retrieved!' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWatchHistory(@User() user: UserEntity) {
    const watchHistory = await this.watchHistoryService.getWatchHistory(user.id);
    return new GenericResponseDto('The Users Watch History Has Been Successfully Retrieved!', watchHistory);
  }
}
