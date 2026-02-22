import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums';

@Controller('financial')
export class FinancialController {
    constructor(private readonly financialService: FinancialService) { }

    @Roles(RoleEnum.OWNER, RoleEnum.MANAGER)
    @Post('transactions')
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.financialService.createTransaction(createTransactionDto);
    }

    @Get('transactions')
    findAll() {
        return this.financialService.findAllTransactions();
    }

    @Get('transactions/:id')
    findOne(@Param('id') id: string) {
        return this.financialService.findOneTransaction(id);
    }

    @Patch('transactions/:id')
    update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
        return this.financialService.updateTransaction(id, updateTransactionDto);
    }

    @Delete('transactions/:id')
    remove(@Param('id') id: string) {
        return this.financialService.removeTransaction(id);
    }
}
