import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Shipment } from '../shipments/shipment.entity';

/**
 * Puente con el hardware (impresora de etiquetas, luces/pantallas de la bodega, etc.) via MQTT.
 * Sin MQTT_URL no falla: deja el trabajo en el log, para poder desarrollar sin dispositivos.
 */
@Injectable()
export class HardwareService implements OnModuleDestroy {
  private readonly log = new Logger(HardwareService.name);
  private client?: mqtt.MqttClient;

  constructor() {
    const url = process.env.MQTT_URL;
    if (url) {
      this.client = mqtt.connect(url, { username: process.env.MQTT_USER, password: process.env.MQTT_PASSWORD });
      this.client.on('error', (e) => this.log.error(`MQTT: ${e.message}`));
    } else {
      this.log.warn('MQTT_URL no configurado: los trabajos de hardware solo se registran en el log');
    }
  }

  /** Pide imprimir la etiqueta de envio. Devuelve true si se publico (o se simulo). */
  printLabel(s: Shipment): boolean {
    const job = {
      trackingCode: s.trackingCode,
      recipient: s.recipientName,
      address: s.address,
      items: s.items,
    };
    const topic = process.env.MQTT_LABEL_TOPIC ?? 'shopp/warehouse/label-printer/jobs';
    if (!this.client) {
      this.log.log(`[simulado] ${topic} <- ${JSON.stringify(job)}`);
      return true;
    }
    this.client.publish(topic, JSON.stringify(job), { qos: 1 });
    return true;
  }

  onModuleDestroy() {
    this.client?.end();
  }
}
