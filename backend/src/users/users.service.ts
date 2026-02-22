import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        // IMPORTANTE: Hash password here in production
        return this.prisma.user.create({
            data: createUserDto,
        });
    }

    findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                clinicId: true,
                createdAt: true,
            }
        });
    }

    findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                clinic: true,
                professional: true,
            }
        });
    }

    update(id: string, updateUserDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }

    remove(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
