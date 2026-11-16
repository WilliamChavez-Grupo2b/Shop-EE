import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { Profile } from './profile.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Profile[]>;
    findOne(id: number): Promise<Profile>;
    create(dto: CreateUserDto): Promise<Profile>;
    update(id: number, dto: UpdateUserDto): Promise<Profile>;
    delete(id: number): Promise<void>;
}
