import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ShipmentStatus {
  CREATED = 'CREATED',
  LABEL_PRINTED = 'LABEL_PRINTED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

@Entity()
export class Shipment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true }) @Column() orderId: string;
  @Index({ unique: true }) @Column() trackingCode: string;
  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.CREATED }) status: ShipmentStatus;

  @Column() recipientName: string;
  @Column() address: string;
  @Column({ type: 'jsonb', default: [] }) items: { name: string; quantity: number }[];
  /** Historial de eventos (quien/que lo cambio): trazabilidad de lo que hace el hardware. */
  @Column({ type: 'jsonb', default: [] }) events: { at: string; status: string; source: string }[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
