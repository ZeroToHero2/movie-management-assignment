import { Repository } from 'typeorm';
import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { SessionEntity } from '@domain/sessions/entities/session.entity';

export async function createMovies(
  movieRepository: Repository<MovieEntity>,
  moviesData: { name: string; ageRestriction: number }[],
): Promise<MovieEntity[]> {
  const movies: MovieEntity[] = [];

  for (let i = 0; i < moviesData.length; i++) {
    const movie = new MovieEntity();
    movie.name = moviesData[i].name;
    movie.ageRestriction = moviesData[i].ageRestriction;
    await movieRepository.save(movie);
    movies.push(movie);
  }
  return movies;
}

export async function createSessions(
  sessionRepository: Repository<SessionEntity>,
  sessionsData: { date: string; timeSlot: string; roomNumber: number }[],
  movies: MovieEntity[],
): Promise<SessionEntity[]> {
  const sessions: SessionEntity[] = [];

  for (let i = 0; i < sessionsData.length; i++) {
    const session = new SessionEntity();
    session.date = new Date(sessionsData[i].date);
    session.timeSlot = sessionsData[i].timeSlot as TimeSlot;
    session.roomNumber = sessionsData[i].roomNumber;
    session.movie = movies[i];
    await sessionRepository.save(session);
    sessions.push(session);
  }
  return sessions;
}
