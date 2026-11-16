import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { Product } from './products.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(): Promise<Product[]>;
    findOne(id: number): Promise<Product>;
    create(dto: CreateProductDto): Promise<Product>;
    update(id: number, dto: UpdateProductDto): Promise<Product>;
    delete(id: number): Promise<void>;
}
