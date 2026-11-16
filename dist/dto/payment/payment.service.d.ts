import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.dto';
export declare class PaymentService {
    private readonly paymentRepository;
    constructor(paymentRepository: Repository<Payment>);
    findAll(): Promise<Payment[]>;
    findOne(id: number): Promise<Payment | null>;
    create(dto: CreatePaymentDto): Promise<Payment>;
    update(id: number, dto: UpdatePaymentDto): Promise<Payment | null>;
    delete(id: number): Promise<void>;
}
