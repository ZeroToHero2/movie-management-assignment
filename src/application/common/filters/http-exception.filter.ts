import { HttpAdapterHost } from '@nestjs/core';
import { BaseError } from '@application/common/error';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof BaseError
        ? exception.status
        : exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      code: exception?.code || 'Unknown Error Code',
      error: exception?.error || exception?.response?.message || 'Unknown Error',
      message: exception?.message || 'Someting Went Wrong',
      statusCode: exception?.status || 500,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
