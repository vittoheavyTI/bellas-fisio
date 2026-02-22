import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class FinancialService {
    constructor(private prisma: PrismaService) { }

    async createTransaction(createTransactionDto: CreateTransactionDto) {
        const { payments, ...transactionData } = createTransactionDto;
        return this.prisma.transaction.create({
            data: {
                ...transactionData,
                payments: {
                    create: payments,
                }
            },
            include: {
                payments: true,
            }
        });
    }

    findAllTransactions() {
        return this.prisma.transaction.findMany({
            include: {
                payments: true,
            }
        });
    }

    findOneTransaction(id: string) {
        return this.prisma.transaction.findUnique({
            where: { id },
            include: {
                payments: true,
            }
        });
    }

    updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto) {
        const { payments, ...transactionData } = updateTransactionDto;
        // Simplificado: Apenas atualiza dados da transação. 
        // Em um sistema real, gerenciaríamos inclusão/deleção de pagamentos.
        return this.prisma.transaction.update({
            where: { id },
            data: transactionData,
        });
    }

    removeTransaction(id: string) {
        return this.prisma.transaction.delete({
            where: { id },
        });
    }
}
