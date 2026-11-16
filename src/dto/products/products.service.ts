import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto, UpdateProductDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) { }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOneBy({ id });
  }

  create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product | null> {
    await this.productsRepository.update(id, dto);
    return this.productsRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Product ${id} not found`);
  }
}
