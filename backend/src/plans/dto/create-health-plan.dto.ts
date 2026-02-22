import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHealthPlanDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome do plano é obrigatório' })
    name: string;
}
