import { UserEntity } from '@domain/users/entities/user.entity';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { Entity, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity('watch-histories')
export class WatchHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  user: Relation<UserEntity>;

  @ManyToOne(() => MovieEntity)
  movie: Relation<MovieEntity>;

  @Column()
  watchedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
