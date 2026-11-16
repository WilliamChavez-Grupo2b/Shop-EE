import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
import { Order } from './order.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    create(dto: CreateOrderDto): Promise<Order>;
    update(id: number, dto: UpdateOrderDto): Promise<Order>;
    delete(id: number): Promise<void>;
}
