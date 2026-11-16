import { ShipmentService } from './shipment.service';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.dto';
import { Shipment } from './shipment.entity';
export declare class ShipmentController {
    private readonly shipmentService;
    constructor(shipmentService: ShipmentService);
    findAll(): Promise<Shipment[]>;
    findOne(id: number): Promise<Shipment>;
    create(dto: CreateShipmentDto): Promise<Shipment>;
    update(id: number, dto: UpdateShipmentDto): Promise<Shipment>;
    delete(id: number): Promise<void>;
}
