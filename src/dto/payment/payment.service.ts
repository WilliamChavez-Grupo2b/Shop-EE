import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) { }

  findAll(): Promise<Payment[]> {
    return this.paymentRepository.find();
  }

  async findOne(id: number): Promise<Payment | null> {
    return this.paymentRepository.findOneBy({ id });
  }

  create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(dto);
    return this.paymentRepository.save(payment);
  }

  async update(id: number, dto: UpdatePaymentDto): Promise<Payment | null> {
    await this.paymentRepository.update(id, dto);
    return this.paymentRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const result = await this.paymentRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Payment ${id} not found`);
  }
}
