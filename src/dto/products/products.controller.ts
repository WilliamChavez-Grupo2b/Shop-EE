import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { Product } from './products.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    const product = await this.productsService.findOne(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto): Promise<Product> {
    const product = await this.productsService.update(id, dto);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productsService.delete(id);
  }
}
