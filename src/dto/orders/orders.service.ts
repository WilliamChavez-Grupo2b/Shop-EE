import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) { }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  async findOne(id: number): Promise<Order | null> {
    return this.ordersRepository.findOneBy({ id });
  }

  create(dto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(dto);
    return this.ordersRepository.save(order);
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order | null> {
    await this.ordersRepository.update(id, dto);
    return this.ordersRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const result = await this.ordersRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Order ${id} not found`);
  }
}
