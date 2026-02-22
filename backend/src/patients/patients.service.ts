import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
    constructor(private prisma: PrismaService) { }

    create(createPatientDto: CreatePatientDto) {
        return this.prisma.patient.create({
            data: createPatientDto,
        });
    }

    findAll() {
        return this.prisma.patient.findMany({
            include: {
                clinic: true,
                healthPlan: true,
            }
        });
    }

    findByClinic(clinicId: string) {
        return this.prisma.patient.findMany({
            where: { clinicId },
            include: {
                healthPlan: true,
            }
        });
    }

    findOne(id: string) {
        return this.prisma.patient.findUnique({
            where: { id },
            include: {
                clinic: true,
                healthPlan: true,
                appointments: true,
                medicalRecords: true,
                sessionPacks: true,
            }
        });
    }

    update(id: string, updatePatientDto: UpdatePatientDto) {
        return this.prisma.patient.update({
            where: { id },
            data: updatePatientDto,
        });
    }

    remove(id: string) {
        return this.prisma.patient.delete({
            where: { id },
        });
    }
}
