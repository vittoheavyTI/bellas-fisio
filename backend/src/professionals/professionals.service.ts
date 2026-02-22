import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalsService {
    constructor(private prisma: PrismaService) { }

    create(createProfessionalDto: CreateProfessionalDto) {
        return this.prisma.professional.create({
            data: createProfessionalDto,
        });
    }

    findAll() {
        return this.prisma.professional.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                clinic: true,
            }
        });
    }

    findOne(id: string) {
        return this.prisma.professional.findUnique({
            where: { id },
            include: {
                user: true,
                clinic: true,
                appointments: true,
            }
        });
    }

    update(id: string, updateProfessionalDto: UpdateProfessionalDto) {
        return this.prisma.professional.update({
            where: { id },
            data: updateProfessionalDto,
        });
    }

    remove(id: string) {
        return this.prisma.professional.delete({
            where: { id },
        });
    }
}
