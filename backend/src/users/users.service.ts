import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const { registro, ...userData } = createUserDto as any;

            // Check if email already exists
            const existingUser = await this.prisma.user.findUnique({ where: { email: userData.email } });
            if (existingUser) {
                throw new Error('E-mail já está em uso.');
            }

            // Create professional linked to user
            if (userData.role === 'PROFESSIONAL') {
                return await this.prisma.user.create({
                    data: {
                        ...userData,
                        professional: {
                            create: {
                                name: userData.name,
                                registration: registro,
                                clinicId: userData.clinicId || '',
                            }
                        }
                    },
                    include: { professional: true }
                });
            }

            return await this.prisma.user.create({
                data: userData,
            });
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            throw error;
        }
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

    async update(id: string, updateUserDto: UpdateUserDto) {
        try {
            const { registro, ...userData } = updateUserDto as any;

            return await this.prisma.user.update({
                where: { id },
                data: userData,
            });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    remove(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
