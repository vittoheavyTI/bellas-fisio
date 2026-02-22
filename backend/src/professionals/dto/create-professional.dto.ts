import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProfessionalDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name: string;

    @IsString()
    @IsOptional()
    specialty?: string;

    @IsString()
    @IsOptional()
    registration?: string;

    @IsUUID(4, { message: 'ID de usuário inválido' })
    @IsNotEmpty({ message: 'ID de usuário é obrigatório' })
    userId: string;

    @IsUUID(4, { message: 'ID de clínica inválido' })
    @IsNotEmpty({ message: 'ID de clínica é obrigatório' })
    clinicId: string;
}
