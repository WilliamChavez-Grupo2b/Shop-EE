import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './shipments/shipment.entity';
import { ShipmentsModule } from './shipments/shipments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://shipping:shipping@localhost:5433/shipping',
      entities: [Shipment],
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
    }),
    ShipmentsModule,
  ],
})
export class AppModule {}
