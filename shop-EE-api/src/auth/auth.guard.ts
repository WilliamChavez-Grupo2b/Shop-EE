import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Role } from '../database/entities';

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

export const AuthUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser =>
    context.switchToHttp().getRequest().user,
);

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
export const Public = () => SetMetadata('isPublic', true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ])) return true;
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Autenticacion requerida');
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; role: Role }>(authorization.slice(7));
      if (!payload.sub || !Object.values(Role).includes(payload.role)) {
        throw new UnauthorizedException('Token invalido');
      }
      request.user = { id: payload.sub, role: payload.role } satisfies AuthenticatedUser;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalido');
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest().user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException('Autenticacion requerida');
    if (!roles.includes(user.role)) throw new ForbiddenException('Permiso insuficiente');
    return true;
  }
}
