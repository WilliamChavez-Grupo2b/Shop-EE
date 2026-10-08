import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { CreateShipmentDto, ScanDto, UpdateStatusDto } from './shipment.dto';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
@UseGuards(ApiKeyGuard)
export class ShipmentsController {
  constructor(private readonly service: ShipmentsService) {}

  private onlyService(req: { caller: string }) {
    if (req.caller !== 'service') throw new ForbiddenException('Solo el backend principal puede hacer esto');
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateShipmentDto) {
    this.onlyService(req);
    return this.service.create(dto).then((s) => ({ id: s.id, trackingCode: s.trackingCode, status: s.status }));
  }

  @Get(':id')
  get(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    this.onlyService(req);
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    this.onlyService(req);
    return this.service.updateStatus(id, dto.status);
  }

  /** Lectores/escaneres de la bodega: aceptan DEVICE_API_KEY o la de servicio. */
  @Post('scan')
  scan(@Body() dto: ScanDto) {
    return this.service.scan(dto.trackingCode, dto.status, dto.deviceId);
  }
}
