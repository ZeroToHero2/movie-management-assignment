import { ConfigService } from '@nestjs/config';
import { catchError, timeout } from 'rxjs/operators';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';

@Injectable()
class TimeoutInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutValue = this.configService.get<number>('TIMEOUT');

    return next.handle().pipe(
      timeout(timeoutValue),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}

export default TimeoutInterceptor;
