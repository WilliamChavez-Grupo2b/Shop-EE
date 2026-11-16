import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { Category } from './category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    const category = await this.categoryService.findOne(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryService.update(id, dto);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.categoryService.delete(id);
  }
}
