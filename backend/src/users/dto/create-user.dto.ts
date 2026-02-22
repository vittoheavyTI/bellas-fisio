import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { RoleEnum } from '../../common/enums';

export class CreateUserDto {
    @IsEmail({}, { message: 'E-mail inválido' })
    @IsNotEmpty({ message: 'E-mail é obrigatório' })
    email: string;

    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    password: string;

    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name: string;

    @IsEnum(RoleEnum)
    role: RoleEnum;

    @IsOptional()
    phone?: string;

    @IsOptional()
    photoUrl?: string;

    @IsOptional()
    clinicId?: string;
}
