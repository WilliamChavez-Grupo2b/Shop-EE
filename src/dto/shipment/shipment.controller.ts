import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, NotFoundException } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.dto';
import { Shipment } from './shipment.entity';

@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) { }

  @Get()
  findAll(): Promise<Shipment[]> {
    return this.shipmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Shipment> {
    const shipment = await this.shipmentService.findOne(id);
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
    return shipment;
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateShipmentDto): Promise<Shipment> {
    return this.shipmentService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.shipmentService.update(id, dto);
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
    return shipment;
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.shipmentService.delete(id);
  }
}
