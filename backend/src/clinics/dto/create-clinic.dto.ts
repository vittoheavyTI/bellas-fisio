import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClinicDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome da clínica é obrigatório' })
    name: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
