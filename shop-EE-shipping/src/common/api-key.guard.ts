import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

export type Caller = 'service' | 'device';

/**
 * Acepta dos llaves distintas:
 *  - SHIPPING_API_KEY: la usa la API principal (crear envios, consultar).
 *  - DEVICE_API_KEY: la usan lectores/impresoras (solo escaneos).
 * Se guarda quien llamo en request.caller para que cada ruta pueda exigir el que corresponda.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const sent = String(req.headers['x-api-key'] ?? '');
    if (this.same(sent, process.env.SHIPPING_API_KEY ?? 'dev-shipping-key')) req.caller = 'service';
    else if (this.same(sent, process.env.DEVICE_API_KEY ?? 'dev-device-key')) req.caller = 'device';
    else throw new UnauthorizedException('API key invalida');
    return true;
  }

  private same(a: string, b: string): boolean {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  }
}
