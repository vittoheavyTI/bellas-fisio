import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProcedureDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome do procedimento é obrigatório' })
    name: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Preço base é obrigatório' })
    basePrice: number;
}
