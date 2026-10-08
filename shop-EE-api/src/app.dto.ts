import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ProductType } from './database/entities';

export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() @IsNotEmpty() fullName: string;
}

export class LoginDto {
  @IsString() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() password: string;
}

export class VariantDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) priceDelta?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
}

export class ProductDto {
  @IsString() @IsNotEmpty() sku: string;
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price: number;
  @IsEnum(ProductType) type: ProductType;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsString() digitalFileUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class CategoryDto {
  @IsString() @IsNotEmpty() name: string;
}

export class AiDescriptionDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() notes?: string;
}

export class OrderLineDto {
  @IsUUID() productId: string;
  @IsOptional() @IsUUID() variantId?: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderLineDto)
  items: OrderLineDto[];
  @IsOptional() @IsString() shippingAddress?: string;
  @IsOptional() @IsString() notes?: string;
}

export class ProofDto {
  @IsString() @IsNotEmpty() transferReference: string;
  @IsString() @IsNotEmpty() proofUrl: string;
}

export class RejectDto {
  @IsOptional() @IsString() reason?: string;
}

export class ShippingUpdateDto {
  @IsString() @IsNotEmpty() status: string;
  @IsOptional() @IsString() trackingCode?: string;
}
