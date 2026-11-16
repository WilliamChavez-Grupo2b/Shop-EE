import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category | null> {
    return this.categoryRepository.findOneBy({ id });
  }

  create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category | null> {
    await this.categoryRepository.update(id, dto);
    return this.categoryRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Category ${id} not found`);
  }
}
