import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { ShipmentStatus } from './shipment.entity';

export class ItemDto {
  @IsString() @IsNotEmpty() name: string;
  @IsInt() @Min(1) quantity: number;
}

export class CreateShipmentDto {
  @IsString() @IsNotEmpty() orderId: string;
  @IsString() @IsNotEmpty() recipientName: string;
  @IsString() @IsNotEmpty() address: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemDto) items: ItemDto[];
}

export class UpdateStatusDto {
  @IsEnum(ShipmentStatus) status: ShipmentStatus;
}

/** Lo que envia un lector/escaner: el codigo de la guia y el evento detectado. */
export class ScanDto {
  @IsString() @IsNotEmpty() trackingCode: string;
  @IsEnum(ShipmentStatus) status: ShipmentStatus;
  @IsString() @IsNotEmpty() deviceId: string;
}
