export declare class CreateOrderDto {
    productId: number;
    userId?: number;
    quantity: number;
    totalValue: number;
}
export declare class UpdateOrderDto {
    productId?: number;
    userId?: number;
    quantity?: number;
    totalValue?: number;
}
