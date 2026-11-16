import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { Category } from './category.entity';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    findAll(): Promise<Category[]>;
    findOne(id: number): Promise<Category>;
    create(dto: CreateCategoryDto): Promise<Category>;
    update(id: number, dto: UpdateCategoryDto): Promise<Category>;
    delete(id: number): Promise<void>;
}
