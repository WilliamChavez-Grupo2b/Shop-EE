import { Repository } from 'typeorm';
import { Shipment } from './shipment.entity';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.dto';
export declare class ShipmentService {
    private readonly shipmentRepository;
    constructor(shipmentRepository: Repository<Shipment>);
    findAll(): Promise<Shipment[]>;
    findOne(id: number): Promise<Shipment | null>;
    create(dto: CreateShipmentDto): Promise<Shipment>;
    update(id: number, dto: UpdateShipmentDto): Promise<Shipment | null>;
    delete(id: number): Promise<void>;
}
