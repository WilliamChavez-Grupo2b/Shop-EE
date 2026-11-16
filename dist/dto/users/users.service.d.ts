import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<Profile>);
    findAll(): Promise<Profile[]>;
    findOne(id: number): Promise<Profile | null>;
    create(dto: CreateUserDto): Promise<Profile>;
    update(id: number, dto: UpdateUserDto): Promise<Profile | null>;
    delete(id: number): Promise<void>;
}
