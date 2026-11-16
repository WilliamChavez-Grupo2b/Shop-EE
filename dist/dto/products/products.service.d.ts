import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto, UpdateProductDto } from './products.dto';
export declare class ProductsService {
    private readonly productsRepository;
    constructor(productsRepository: Repository<Product>);
    findAll(): Promise<Product[]>;
    findOne(id: number): Promise<Product | null>;
    create(dto: CreateProductDto): Promise<Product>;
    update(id: number, dto: UpdateProductDto): Promise<Product | null>;
    delete(id: number): Promise<void>;
}
