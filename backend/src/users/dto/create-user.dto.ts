import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, IsString, ValidateIf } from 'class-validator';
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

    @IsOptional({ message: 'Registro opcional' })
    @IsString()
    @ValidateIf(o => o.role === RoleEnum.PROFESSIONAL)
    @IsNotEmpty({ message: 'Registro CREFITO obrigatório para Profissional' })
    registro?: string;

    @IsEnum(RoleEnum)
    role: RoleEnum;

    @IsOptional()
    clinicId?: string;
}
