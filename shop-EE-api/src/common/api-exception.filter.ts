import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';

@Catch()
@Injectable()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const message = this.messageOf(exception, payload);
    let error = message;
    let details: Record<string, string> | null = null;

    if (Array.isArray(message)) {
      error = 'Datos invalidos';
      details = {};
      for (const validationMessage of message) {
        if (typeof validationMessage !== 'string') continue;
        const separator = validationMessage.indexOf(' ');
        const field = separator === -1 ? validationMessage : validationMessage.slice(0, separator);
        details[field] ??= separator === -1 ? validationMessage : validationMessage.slice(separator + 1);
      }
    }

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? exception.message : 'Unknown internal error',
        exception instanceof Error ? exception.stack : undefined,
      );
      error = 'Internal server error';
    }

    response.status(status).json({ status, error, details });
  }

  private messageOf(exception: unknown, payload: unknown): string | string[] {
    if (typeof payload === 'string') return payload;
    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = (payload as { message: unknown }).message;
      if (typeof message === 'string' || Array.isArray(message)) return message;
    }
    return exception instanceof Error ? exception.message : 'Internal server error';
  }
}
