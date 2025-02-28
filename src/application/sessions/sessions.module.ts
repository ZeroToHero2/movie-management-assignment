import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from '@api/sessions/sessions.controller';
import { SessionsService } from '@application/sessions/sessions.service';
import { SessionEntity } from '@domain/sessions/entities/session.entity';
import { SessionRepository } from '@infrastructure/repositories/session.repository';
import { SessionRepositoryToken } from '@domain/sessions/repositories/session-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    {
      provide: SessionRepositoryToken,
      useClass: SessionRepository,
    },
  ],
  exports: [SessionsService],
})
export class SessionsModule {}
