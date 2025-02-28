import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';
import { GenericResponseDto } from '@api/common/dto';
import { Public } from '@application/common/decorators';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Public()
@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get the welcome message for the API' })
  @ApiResponse({ status: 200, description: 'The welcome message has been successfully retrieved.' })
  getHello(): GenericResponseDto<string> {
    return this.appService.getHello();
  }
}
