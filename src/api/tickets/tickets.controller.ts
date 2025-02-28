import { WatchMovieDto } from '@api/tickets/dto';
import { SessionIdDto } from '@api/sessions/dto';
import { User } from '@application/common/decorators';
import { Controller, Param, Post } from '@nestjs/common';
import { UserEntity } from '@domain/users/entities/user.entity';
import { GenericResponseDto } from '@api/common/dto/generic-response.dto';
import { TicketsService } from '../../application/tickets/tickets.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post(':sessionId/checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy a Ticket for a Movie Session' })
  @ApiResponse({ status: 200, description: 'The Ticket Has Been Successfully Bought!' })
  @ApiResponse({ status: 400, description: 'Invalid Movie ID or Session ID.' })
  async buyTicket(@User() user: UserEntity, @Param() params: SessionIdDto) {
    const ticket = await this.ticketsService.buyTicket(user, params.sessionId);
    return new GenericResponseDto('The Ticket Has Been Successfully Bought!', ticket);
  }

  @Post(':ticketId/watch')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Watch a Movie Using a Ticket' })
  @ApiResponse({ status: 200, description: 'The Movie Has Been Successfully Watched!' })
  @ApiResponse({ status: 400, description: 'Invalid Ticket ID.' })
  async watchMovie(@User() user: UserEntity, @Param() watchMovieDto: WatchMovieDto) {
    const movie = await this.ticketsService.watchMovie(user, watchMovieDto);
    return new GenericResponseDto('The Movie Has Been Successfully Watched!', movie);
  }
}
