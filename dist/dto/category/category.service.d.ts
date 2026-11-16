import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
export declare class CategoryService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    findAll(): Promise<Category[]>;
    findOne(id: number): Promise<Category | null>;
    create(dto: CreateCategoryDto): Promise<Category>;
    update(id: number, dto: UpdateCategoryDto): Promise<Category | null>;
    delete(id: number): Promise<void>;
}
