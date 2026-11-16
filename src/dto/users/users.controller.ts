import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { Profile } from './profile.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll(): Promise<Profile[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Profile> {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateUserDto): Promise<Profile> {
    return this.usersService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto): Promise<Profile> {
    const user = await this.usersService.update(id, dto);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.delete(id);
  }
}
