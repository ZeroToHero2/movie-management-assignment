import { Exclude } from 'class-transformer';
import { Role } from '@domain/auth/enums/role.enum';
import { TicketEntity } from '@domain/tickets/entities/ticket.entity';
import { WatchHistoryEntity } from '@domain/watch-history/entites/watch-history.entity';
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany, Relation } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column()
  age: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => TicketEntity, (ticket) => ticket.user)
  tickets: Relation<TicketEntity[]>;

  @OneToMany(() => WatchHistoryEntity, (watchHistory) => watchHistory.user)
  watchHistories: Relation<WatchHistoryEntity[]>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
