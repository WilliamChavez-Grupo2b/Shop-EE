export declare class CreatePaymentDto {
    userId: number;
    orderId: number;
    amount: number;
    method: string;
}
export declare class UpdatePaymentDto {
    userId?: number;
    orderId?: number;
    amount?: number;
    method?: string;
}
