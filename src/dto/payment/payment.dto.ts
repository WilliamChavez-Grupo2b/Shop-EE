import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  userId: number;

  @IsInt()
  orderId: number;

  @IsInt()
  @Min(0)
  amount: number;

  @IsString()
  @MinLength(1)
  method: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsInt()
  orderId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  method?: string;
}