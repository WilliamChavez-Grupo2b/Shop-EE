import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty} from 'class-validator';
import { Role } from '../../model/Role';

export class ProfileDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    nickname: string;

    @IsString()
    @IsOptional()
    avatar: string;

    @IsEnum(Role)
    role: Role;
}