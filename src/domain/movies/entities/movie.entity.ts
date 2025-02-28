import { Status } from '@application/common/enums/status.enum';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity('movies')
export class MovieEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  ageRestriction: number;

  @OneToMany(() => SessionEntity, (session) => session.movie)
  sessions: Relation<SessionEntity[]>;

  @Column({ default: Status.ACTIVE })
  status: Status;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
