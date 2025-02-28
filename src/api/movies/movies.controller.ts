import { Status } from '@application/common/enums';
import { Role } from '@domain/auth/enums/role.enum';
import { Roles, Public } from '@application/common/decorators';
import { MoviesService } from '@application/movies/movies.service';
import { GenericResponseDto } from '@api/common/dto/generic-response.dto';
import { ComparisonSymbols } from '@application/common/enums/comparisan-symbols.enum';
import { Controller, Post, Put, Delete, Body, Param, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateMovieDto, UpdateMovieDto, GetMoviesDto, BulkCreateMovieDto, BulkDeleteMovieDto } from '@api/movies/dto';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'Return All Active Movies' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by movie name' })
  @ApiQuery({ name: 'ageRestriction', required: false, type: Number, description: 'Filter by age restriction' })
  @ApiQuery({
    name: 'ageRestrictionComparisonSymbol',
    required: false,
    enum: ComparisonSymbols,
    description: 'Comparison symbol for age restriction filtering',
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (ASC or DESC)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort by field (e.g., "name", "ageRestriction", "createdAt")' })
  @ApiOperation({ summary: 'Get All Active Movies', description: 'List all active movies with optional sorting and filtering' })
  async getActiveMovies(@Query() getMoviesDto: GetMoviesDto) {
    const movies = await this.moviesService.getActiveMovies(getMoviesDto);
    return new GenericResponseDto('All Active Movies Have Been Returned!', movies);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a Movie by ID' })
  @ApiResponse({ status: 200, description: 'The Movie Has Been Successfully Returned!' })
  async getMovie(@Param('id') id: string) {
    const movie = await this.moviesService.getMovieWithSessions(id, Status.ACTIVE);
    return new GenericResponseDto('The Movie Has Been Successfully Returned!', movie);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create a New Movie' })
  @ApiResponse({ status: 201, description: 'The Movie Has Been Successfully Created!' })
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    const movie = await this.moviesService.createMovie(createMovieDto);
    return new GenericResponseDto('The Movie Has Been Successfully Created!', movie);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update a Movie' })
  @ApiResponse({ status: 200, description: 'The Movie Has Been Successfully Updated!' })
  async updateMovie(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    const movie = await this.moviesService.updateMovie(id, updateMovieDto);
    return new GenericResponseDto('The Movie Has Been Successfully Updated!', movie);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Soft Delete a Movie' })
  @ApiResponse({ status: 200, description: 'The Movie Has Been Successfully Deleted!' })
  async deleteMovie(@Param('id') id: string) {
    const result = await this.moviesService.softDeleteMovie(id);
    return new GenericResponseDto('The Movie Has Been Successfully Deleted!', result);
  }

  @Post('/bulk/add')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Bulk Add Movies' })
  @ApiResponse({ status: 201, description: 'The Movies Have Been Successfully Created!' })
  async bulkAddMovies(@Body() bulkCreateMovieDto: BulkCreateMovieDto) {
    const movies = await this.moviesService.bulkAddMovies(bulkCreateMovieDto);
    return new GenericResponseDto('The Movies Have Been Successfully Created!', movies);
  }

  @Post('/bulk/delete')
  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Bulk Delete Movies' })
  @ApiResponse({ status: 200, description: 'The Movies Have Been Successfully Deleted!' })
  async bulkDeleteMovies(@Body() bulkDeleteMovieDto: BulkDeleteMovieDto) {
    const movies = await this.moviesService.bulkDeleteMovies(bulkDeleteMovieDto);
    return new GenericResponseDto('The Movies Have Been Successfully Deleted!', movies);
  }
}
