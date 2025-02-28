import { TimeSlot } from '@domain/sessions/enums/time.slot.enum';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { Entity, Column, Unique, ManyToOne, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity('sessions')
@Unique(['date', 'timeSlot', 'roomNumber'])
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MovieEntity, (movie) => movie.sessions)
  movie: Relation<MovieEntity>;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({
    type: 'enum',
    enum: TimeSlot,
  })
  timeSlot: TimeSlot;

  @Column()
  roomNumber: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
