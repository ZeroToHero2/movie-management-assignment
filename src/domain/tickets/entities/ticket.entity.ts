import { UserEntity } from '@domain/users/entities/user.entity';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { Entity, Column, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, Relation } from 'typeorm';

@Entity('tickets')
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  user: Relation<UserEntity>;

  @ManyToOne(() => SessionEntity)
  session: Relation<SessionEntity>;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
