import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LogsService } from './logs.service.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logsService: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttp ? exception.getResponse() : 'Error interno del servidor';

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logsService.registrar('error', request.url, String((exception as Error)?.message ?? exception), stack);
    }

    response.status(status).json(
      typeof message === 'string' ? { statusCode: status, message } : { statusCode: status, ...(message as object) },
    );
  }
}
