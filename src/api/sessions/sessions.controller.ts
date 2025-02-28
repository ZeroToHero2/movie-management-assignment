import { MovieIdDto } from '@api/movies/dto';
import { Role } from '@domain/auth/enums/role.enum';
import { GenericResponseDto } from '@api/common/dto';
import { Roles } from '@application/common/decorators';
import { SessionsService } from '@application/sessions/sessions.service';
import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSessionDto, SessionIdDto, UpdateSessionDto } from '@api/sessions/dto';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('/:movieId')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Add a New Session to a Movie' })
  @ApiResponse({ status: 201, description: 'The Session Has Been Successfully Added!' })
  @ApiResponse({ status: 409, description: 'This Room is Already Booked for the Given Date and Time Slot' })
  async addSession(@Param() params: MovieIdDto, @Body() createSessionDto: CreateSessionDto) {
    const session = await this.sessionsService.addSessionToMovie(params.movieId, createSessionDto);
    return new GenericResponseDto('The Session Has Been Successfully Added!', session);
  }

  @Patch('/:sessionId')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update a Session by Id' })
  @ApiResponse({ status: 200, description: 'The Session Has Been Successfully Updated!' })
  @ApiResponse({ status: 400, description: 'Invalid Session Id' })
  async updateSession(@Param() params: SessionIdDto, @Body() updateSessionDto: UpdateSessionDto) {
    const session = await this.sessionsService.updateSession(params.sessionId, updateSessionDto);
    return new GenericResponseDto('The Session Has Been Successfully Updated!', session);
  }

  @Delete('/:sessionId')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Delete a Session by Id' })
  @ApiResponse({ status: 200, description: 'The Session Has Been Successfully Deleted!' })
  @ApiResponse({ status: 400, description: 'Invalid Session Id' })
  async deleteSession(@Param() params: SessionIdDto) {
    const session = await this.sessionsService.deleteSession(params.sessionId);
    return new GenericResponseDto('The Session Has Been Successfully Deleted!', session);
  }

  @Delete('/movie/:movieId')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Delete All Sessions of a Movie' })
  @ApiResponse({ status: 200, description: 'The Sessions Have Been Successfully Deleted!' })
  @ApiResponse({ status: 400, description: 'Invalid Movie Id' })
  async deleteAllSessions(@Param() params: MovieIdDto) {
    await this.sessionsService.deleteAllSessions(params.movieId);
    return new GenericResponseDto('All Sessions Have Been Successfully Deleted!');
  }
}
