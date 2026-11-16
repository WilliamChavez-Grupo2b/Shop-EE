import { PaymentService } from './payment.service';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.dto';
import { Payment } from './payment.entity';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    findAll(): Promise<Payment[]>;
    findOne(id: number): Promise<Payment>;
    create(dto: CreatePaymentDto): Promise<Payment>;
    update(id: number, dto: UpdatePaymentDto): Promise<Payment>;
    delete(id: number): Promise<void>;
}
