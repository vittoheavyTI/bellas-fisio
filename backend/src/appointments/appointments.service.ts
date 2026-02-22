import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) { }

    create(createAppointmentDto: CreateAppointmentDto) {
        return this.prisma.appointment.create({
            data: createAppointmentDto,
        });
    }

    findAll() {
        return this.prisma.appointment.findMany({
            include: {
                patient: true,
                professional: true,
                procedure: true,
            }
        });
    }

    findOne(id: string) {
        return this.prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: true,
                professional: true,
                procedure: true,
                medicalRecord: true,
            }
        });
    }

    update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
        return this.prisma.appointment.update({
            where: { id },
            data: updateAppointmentDto,
        });
    }

    remove(id: string) {
        return this.prisma.appointment.delete({
            where: { id },
        });
    }
}
