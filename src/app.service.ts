import { Injectable } from '@nestjs/common';
import { GenericResponseDto } from '@api/common/dto';

@Injectable()
export class AppService {
  getHello(): GenericResponseDto<string> {
    return new GenericResponseDto('Welcome to the Movie Management API!');
  }
}
