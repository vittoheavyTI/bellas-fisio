import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
    constructor(private prisma: PrismaService) { }

    create(createClinicDto: CreateClinicDto) {
        return this.prisma.clinic.create({
            data: createClinicDto,
        });
    }

    findAll() {
        return this.prisma.clinic.findMany();
    }

    findOne(id: string) {
        return this.prisma.clinic.findUnique({
            where: { id },
            include: {
                professionals: true,
                patients: true,
            }
        });
    }

    update(id: string, updateClinicDto: UpdateClinicDto) {
        return this.prisma.clinic.update({
            where: { id },
            data: updateClinicDto,
        });
    }

    remove(id: string) {
        return this.prisma.clinic.delete({
            where: { id },
        });
    }
}
