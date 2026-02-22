import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreateHealthPlanDto } from './dto/create-health-plan.dto';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums';

@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @Roles(RoleEnum.OWNER, RoleEnum.MANAGER)
    @Post()
    createPlan(@Body() createHealthPlanDto: CreateHealthPlanDto) {
        return this.plansService.createPlan(createHealthPlanDto);
    }

    @Get()
    findAllPlans() {
        return this.plansService.findAllPlans();
    }

    @Roles(RoleEnum.OWNER, RoleEnum.MANAGER)
    @Post('procedures')
    createProcedure(@Body() createProcedureDto: CreateProcedureDto) {
        return this.plansService.createProcedure(createProcedureDto);
    }

    @Get('procedures')
    findAllProcedures() {
        return this.plansService.findAllProcedures();
    }

    @Roles(RoleEnum.OWNER, RoleEnum.MANAGER)
    @Post(':planId/procedures/:procedureId')
    linkProcedure(
        @Param('planId') planId: string,
        @Param('procedureId') procedureId: string,
        @Body('customPrice') customPrice: number,
    ) {
        return this.plansService.linkPlanToProcedure(planId, procedureId, customPrice);
    }
}
