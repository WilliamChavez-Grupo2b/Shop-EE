import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai/ai.service';
import { JwtAuthGuard, RolesGuard } from './auth/auth.guard';
import {
  Category,
  OrderItem,
  Product,
  ProductVariant,
  ShopOrder,
  TransferPayment,
  User,
} from './database/entities';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ApiExceptionFilter } from './common/api-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DB_URL', 'postgresql://shopp:shopp@localhost:5432/shopp'),
        username: config.get<string>('DB_USER', 'shopp'),
        password: config.get<string>('DB_PASSWORD', 'shopp'),
        entities: [User, Category, Product, ProductVariant, ShopOrder, OrderItem, TransferPayment],
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: config.get<string>(
          'TYPEORM_SYNCHRONIZE',
          config.get<string>('NODE_ENV') !== 'production' ? 'true' : 'false',
        ) === 'true',
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'cambia-esto-por-un-secreto-de-minimo-32-bytes!!'),
        signOptions: { expiresIn: `${config.get<number>('JWT_TTL_MINUTES', 120)}m` },
      }),
    }),
  ],
  controllers: [ShopController],
  providers: [
    ShopService,
    AiService,
    RolesGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
