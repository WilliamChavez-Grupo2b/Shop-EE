
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './shipment.entity';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.dto';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) { }

  findAll(): Promise<Shipment[]> {
    return this.shipmentRepository.find();
  }

  async findOne(id: number): Promise<Shipment | null> {
    return this.shipmentRepository.findOneBy({ id });
  }

  create(dto: CreateShipmentDto): Promise<Shipment> {
    const shipment = this.shipmentRepository.create(dto);
    return this.shipmentRepository.save(shipment);
  }

  async update(id: number, dto: UpdateShipmentDto): Promise<Shipment | null> {
    await this.shipmentRepository.update(id, dto);
    return this.shipmentRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const result = await this.shipmentRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Shipment ${id} not found`);
  }
}
