import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  productId: number;

  @IsInt()
  @IsOptional()
  userId?: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  totalValue: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalValue?: number;
}
