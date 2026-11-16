"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const products_controller_1 = require("./dto/products/products.controller");
const products_service_1 = require("./dto/products/products.service");
const products_entity_1 = require("./dto/products/products.entity");
const payment_controller_1 = require("./dto/payment/payment.controller");
const payment_service_1 = require("./dto/payment/payment.service");
const payment_entity_1 = require("./dto/payment/payment.entity");
const orders_controller_1 = require("./dto/orders/orders.controller");
const orders_service_1 = require("./dto/orders/orders.service");
const order_entity_1 = require("./dto/orders/order.entity");
const shipment_controller_1 = require("./dto/shipment/shipment.controller");
const shipment_service_1 = require("./dto/shipment/shipment.service");
const shipment_entity_1 = require("./dto/shipment/shipment.entity");
const users_controller_1 = require("./dto/users/users.controller");
const users_service_1 = require("./dto/users/users.service");
const profile_entity_1 = require("./dto/users/profile.entity");
const category_controller_1 = require("./dto/category/category.controller");
const category_service_1 = require("./dto/category/category.service");
const category_entity_1 = require("./dto/category/category.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.POSTGRES_HOST ?? 'localhost',
                port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
                database: process.env.POSTGRES_DB ?? 'shop_ee',
                username: process.env.POSTGRES_USER ?? 'shop_ee_user',
                password: process.env.POSTGRES_PASSWORD ?? 'shop_ee_pass',
                entities: [products_entity_1.Product, payment_entity_1.Payment, order_entity_1.Order, shipment_entity_1.Shipment, profile_entity_1.Profile, category_entity_1.Category],
                synchronize: true,
                autoLoadEntities: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([products_entity_1.Product, payment_entity_1.Payment, order_entity_1.Order, shipment_entity_1.Shipment, profile_entity_1.Profile, category_entity_1.Category]),
        ],
        controllers: [
            app_controller_1.AppController,
            products_controller_1.ProductsController,
            payment_controller_1.PaymentController,
            orders_controller_1.OrdersController,
            shipment_controller_1.ShipmentController,
            users_controller_1.UsersController,
            category_controller_1.CategoryController,
        ],
        providers: [
            app_service_1.AppService,
            products_service_1.ProductsService,
            payment_service_1.PaymentService,
            orders_service_1.OrdersService,
            shipment_service_1.ShipmentService,
            users_service_1.UsersService,
            category_service_1.CategoryService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map