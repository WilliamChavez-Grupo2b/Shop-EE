import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsController } from './dto/products/products.controller';
import { ProductsService } from './dto/products/products.service';
import { Product } from './dto/products/products.entity';
import { PaymentController } from './dto/payment/payment.controller';
import { PaymentService } from './dto/payment/payment.service';
import { Payment } from './dto/payment/payment.entity';
import { OrdersController } from './dto/orders/orders.controller';
import { OrdersService } from './dto/orders/orders.service';
import { Order } from './dto/orders/order.entity';
import { ShipmentController } from './dto/shipment/shipment.controller';
import { ShipmentService } from './dto/shipment/shipment.service';
import { Shipment } from './dto/shipment/shipment.entity';
import { UsersController } from './dto/users/users.controller';
import { UsersService } from './dto/users/users.service';
import { Profile } from './dto/users/profile.entity';
import { CategoryController } from './dto/category/category.controller';
import { CategoryService } from './dto/category/category.service';
import { Category } from './dto/category/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      database: process.env.POSTGRES_DB ?? 'shop_ee',
      username: process.env.POSTGRES_USER ?? 'shop_ee_user',
      password: process.env.POSTGRES_PASSWORD ?? 'shop_ee_pass',
      entities: [Product, Payment, Order, Shipment, Profile, Category],
      synchronize: true, // dev only; use migrations in production
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([Product, Payment, Order, Shipment, Profile, Category]),
  ],
  controllers: [
    AppController,
    ProductsController,
    PaymentController,
    OrdersController,
    ShipmentController,
    UsersController,
    CategoryController,
  ],
  providers: [
    AppService,
    ProductsService,
    PaymentService,
    OrdersService,
    ShipmentService,
    UsersService,
    CategoryService,
  ],
})
export class AppModule { }
