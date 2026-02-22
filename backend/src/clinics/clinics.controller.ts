import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums';

@Controller('clinics')
export class ClinicsController {
    constructor(private readonly clinicsService: ClinicsService) { }

    @Roles(RoleEnum.OWNER) // Apenas donos criam clínicas
    @Post()
    create(@Body() createClinicDto: CreateClinicDto) {
        return this.clinicsService.create(createClinicDto);
    }

    @Get()
    findAll() {
        return this.clinicsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clinicsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClinicDto: UpdateClinicDto) {
        return this.clinicsService.update(id, updateClinicDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clinicsService.remove(id);
    }
}
