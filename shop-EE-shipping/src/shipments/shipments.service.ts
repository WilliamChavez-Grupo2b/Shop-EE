import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { HardwareService } from '../hardware/hardware.service';
import { CreateShipmentDto } from './shipment.dto';
import { Shipment, ShipmentStatus } from './shipment.entity';

@Injectable()
export class ShipmentsService {
  private readonly log = new Logger(ShipmentsService.name);

  constructor(
    @InjectRepository(Shipment) private readonly repo: Repository<Shipment>,
    private readonly hardware: HardwareService,
  ) {}

  /** Idempotente: si la API principal reintenta con el mismo pedido, devuelve el mismo envio. */
  async create(dto: CreateShipmentDto): Promise<Shipment> {
    const existing = await this.repo.findOne({ where: { orderId: dto.orderId } });
    if (existing) return existing;

    const shipment = await this.repo.save(
      this.repo.create({
        ...dto,
        trackingCode: `SHP-${randomBytes(5).toString('hex').toUpperCase()}`,
        status: ShipmentStatus.CREATED,
        events: [{ at: new Date().toISOString(), status: ShipmentStatus.CREATED, source: 'api' }],
      }),
    );
    if (this.hardware.printLabel(shipment)) {
      return this.setStatus(shipment, ShipmentStatus.LABEL_PRINTED, 'label-printer', false);
    }
    return shipment;
  }

  async findOne(id: string): Promise<Shipment> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Envio no encontrado');
    return s;
  }

  async updateStatus(id: string, status: ShipmentStatus, source = 'api'): Promise<Shipment> {
    return this.setStatus(await this.findOne(id), status, source, true);
  }

  /** Evento de un lector/escaner identificado por el codigo de la guia. */
  async scan(trackingCode: string, status: ShipmentStatus, deviceId: string): Promise<Shipment> {
    const s = await this.repo.findOne({ where: { trackingCode } });
    if (!s) throw new NotFoundException('Guia desconocida');
    return this.setStatus(s, status, `device:${deviceId}`, true);
  }

  private async setStatus(s: Shipment, status: ShipmentStatus, source: string, notify: boolean): Promise<Shipment> {
    s.status = status;
    s.events = [...s.events, { at: new Date().toISOString(), status, source }];
    const saved = await this.repo.save(s);
    if (notify && (status === ShipmentStatus.IN_TRANSIT || status === ShipmentStatus.DELIVERED)) {
      await this.notifyMainBackend(saved);
    }
    return saved;
  }

  /** Avisa al backend principal para que actualice el pedido. Un fallo aqui no tumba el escaneo. */
  private async notifyMainBackend(s: Shipment): Promise<void> {
    const base = process.env.MAIN_API_URL ?? 'http://localhost:8080';
    try {
      const res = await fetch(`${base}/api/internal/orders/${s.orderId}/shipping`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_KEY ?? 'dev-internal-key' },
        body: JSON.stringify({ status: s.status, trackingCode: s.trackingCode }),
      });
      if (!res.ok) this.log.error(`Backend principal respondio ${res.status} para el pedido ${s.orderId}`);
    } catch (e) {
      this.log.error(`No se pudo avisar al backend principal: ${(e as Error).message}`);
    }
  }
}
