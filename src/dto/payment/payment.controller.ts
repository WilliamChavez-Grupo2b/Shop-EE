import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.dto';
import { Payment } from './payment.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Get()
  findAll(): Promise<Payment[]> {
    return this.paymentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Payment> {
    const payment = await this.paymentService.findOne(id);
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreatePaymentDto): Promise<Payment> {
    return this.paymentService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.paymentService.update(id, dto);
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentService.delete(id);
  }
}
