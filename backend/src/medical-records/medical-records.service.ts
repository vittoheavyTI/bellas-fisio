import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
    constructor(private prisma: PrismaService) { }

    create(createMedicalRecordDto: CreateMedicalRecordDto) {
        return this.prisma.medicalRecord.create({
            data: createMedicalRecordDto as any,
        });
    }

    findAll(patientId?: string) {
        return this.prisma.medicalRecord.findMany({
            where: patientId ? { patientId } : undefined,
            include: {
                patient: true,
                appointment: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    findOne(id: string) {
        return this.prisma.medicalRecord.findUnique({
            where: { id },
            include: {
                patient: true,
                appointment: true,
            }
        });
    }

    update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto) {
        return this.prisma.medicalRecord.update({
            where: { id },
            data: updateMedicalRecordDto as any,
        });
    }

    remove(id: string) {
        return this.prisma.medicalRecord.delete({
            where: { id },
        });
    }
}
