import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
export declare class OrdersService {
    private readonly ordersRepository;
    constructor(ordersRepository: Repository<Order>);
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order | null>;
    create(dto: CreateOrderDto): Promise<Order>;
    update(id: number, dto: UpdateOrderDto): Promise<Order | null>;
    delete(id: number): Promise<void>;
}
