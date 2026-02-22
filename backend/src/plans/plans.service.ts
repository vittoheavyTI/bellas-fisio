import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHealthPlanDto } from './dto/create-health-plan.dto';
import { CreateProcedureDto } from './dto/create-procedure.dto';

@Injectable()
export class PlansService {
    constructor(private prisma: PrismaService) { }

    // Health Plans
    createPlan(createHealthPlanDto: CreateHealthPlanDto) {
        return this.prisma.healthPlan.create({
            data: createHealthPlanDto,
        });
    }

    findAllPlans() {
        return this.prisma.healthPlan.findMany({
            include: {
                procedures: {
                    include: {
                        procedure: true,
                    }
                }
            }
        });
    }

    // Procedures
    createProcedure(createProcedureDto: CreateProcedureDto) {
        return this.prisma.procedure.create({
            data: createProcedureDto,
        });
    }

    findAllProcedures() {
        return this.prisma.procedure.findMany();
    }

    // Link Plan to Procedure
    async linkPlanToProcedure(planId: string, procedureId: string, customPrice: number) {
        return this.prisma.healthPlanProcedure.create({
            data: {
                healthPlanId: planId,
                procedureId: procedureId,
                customPrice: customPrice,
            }
        });
    }
}
