import { IsNotEmpty, IsOptional, IsString, IsEmail, IsUUID, IsDateString } from 'class-validator';

export class CreatePatientDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome do paciente é obrigatório' })
    name: string;

    @IsString()
    @IsOptional()
    cpf?: string;

    @IsString()
    @IsOptional()
    rg?: string;

    @IsEmail({}, { message: 'E-mail inválido' })
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsDateString({}, { message: 'Data de nascimento inválida' })
    @IsOptional()
    birthDate?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    occupation?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    photoUrl?: string;

    @IsString()
    @IsOptional()
    observations?: string;

    @IsUUID(4, { message: 'ID de clínica inválido' })
    @IsNotEmpty({ message: 'ID de clínica é obrigatório' })
    clinicId: string;

    @IsUUID(4, { message: 'ID de plano de saúde inválido' })
    @IsOptional()
    healthPlanId?: string;
}
