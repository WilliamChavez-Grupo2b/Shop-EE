import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateShipmentDto {
  @IsInt()
  orderId: number;

  @IsString()
  @MinLength(1)
  tracking: string;

  @IsString()
  @MinLength(5)
  address: string;
}

export class UpdateShipmentDto {
  @IsOptional()
  @IsInt()
  orderId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  tracking?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  address?: string;
}
