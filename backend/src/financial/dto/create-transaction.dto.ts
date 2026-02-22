import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionTypeEnum } from '../../common/enums';

class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    method: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsOptional()
    installments?: number;
}

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty({ message: 'Descrição é obrigatória' })
    description: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Valor é obrigatório' })
    amount: number;

    @IsEnum(TransactionTypeEnum)
    @IsNotEmpty({ message: 'Tipo de transação é obrigatório' })
    type: TransactionTypeEnum;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePaymentDto)
    @IsOptional()
    payments?: CreatePaymentDto[];
}
