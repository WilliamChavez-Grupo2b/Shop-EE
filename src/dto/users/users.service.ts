import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile)
    private readonly usersRepository: Repository<Profile>,
  ) { }

  findAll(): Promise<Profile[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<Profile | null> {
    return this.usersRepository.findOneBy({ id });
  }

  create(dto: CreateUserDto): Promise<Profile> {
    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<Profile | null> {
    await this.usersRepository.update(id, dto);
    return this.usersRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`User ${id} not found`);
  }
}
