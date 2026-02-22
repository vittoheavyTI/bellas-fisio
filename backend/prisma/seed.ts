import { PrismaClient } from '@prisma/client';
import { RoleEnum, AppointmentStatusEnum, TransactionTypeEnum } from '../src/common/enums';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seeding...');

    // 1. Criar Clínica
    const clinic = await prisma.clinic.create({
        data: {
            name: 'Bellas Fisio - Luís Eduardo Magalhães',
            address: 'Rua Mato Grosso, 750, Apartamento 02, Centro - Luís Eduardo Magalhães, BA',
            phone: '(77) 9 9991-2540',
        },
    });
    console.log(`Clínica criada: ${clinic.name}`);

    // 2. Criar Usuários e Profissionais
    const prof1User = await prisma.user.create({
        data: {
            email: 'fisiopara@bellasfisio.com',
            password: 'password123',
            name: 'Dr. Ricardo Paraiba',
            role: RoleEnum.PROFESSIONAL,
            clinicId: clinic.id,
        },
    });

    const professional1 = await prisma.professional.create({
        data: {
            name: prof1User.name,
            specialty: 'Fisioterapia Esportiva',
            registration: 'CREFITO-12345',
            userId: prof1User.id,
            clinicId: clinic.id,
        },
    });

    const prof2User = await prisma.user.create({
        data: {
            email: 'fisioana@bellasfisio.com',
            password: 'password123',
            name: 'Dra. Ana Silva',
            role: RoleEnum.PROFESSIONAL,
            clinicId: clinic.id,
        },
    });

    const professional2 = await prisma.professional.create({
        data: {
            name: prof2User.name,
            specialty: 'Neurofuncional',
            registration: 'CREFITO-67890',
            userId: prof2User.id,
            clinicId: clinic.id,
        },
    });
    console.log('Profissionais criados.');

    // 3. Criar Pacientes
    const patientsData = [
        { name: 'João Souza', email: 'joao@email.com', phone: '(77) 98888-1111' },
        { name: 'Maria Oliveira', email: 'maria@email.com', phone: '(77) 98888-2222' },
        { name: 'Carlos Santos', email: 'carlos@email.com', phone: '(77) 98888-3333' },
        { name: 'Fernanda Lima', email: 'fernanda@email.com', phone: '(77) 98888-4444' },
        { name: 'Roberto Rocha', email: 'roberto@email.com', phone: '(77) 98888-5555' },
    ];

    const patients = await Promise.all(
        patientsData.map((p) =>
            prisma.patient.create({
                data: {
                    ...p,
                    clinicId: clinic.id,
                },
            })
        )
    );
    console.log(`${patients.length} pacientes criados.`);

    // 4. Criar Agendamentos
    const today = new Date();
    today.setHours(9, 0, 0, 0);

    const appointmentsData = [
        {
            startTime: new Date(today),
            endTime: new Date(new Date(today).getTime() + 3600000), // +1h
            status: AppointmentStatusEnum.SCHEDULED,
            patientId: patients[0].id,
            professionalId: professional1.id,
            clinicId: clinic.id,
        },
        {
            startTime: new Date(new Date(today).getTime() + 3600000),
            endTime: new Date(new Date(today).getTime() + 7200000),
            status: AppointmentStatusEnum.CONFIRMED,
            patientId: patients[1].id,
            professionalId: professional1.id,
            clinicId: clinic.id,
        },
        {
            startTime: new Date(new Date(today).getTime() + 7200000),
            endTime: new Date(new Date(today).getTime() + 10800000),
            status: AppointmentStatusEnum.SCHEDULED,
            patientId: patients[2].id,
            professionalId: professional2.id,
            clinicId: clinic.id,
        },
    ];

    await Promise.all(
        appointmentsData.map((a) =>
            prisma.appointment.create({
                data: a,
            })
        )
    );
    console.log('Agendamentos criados.');

    // 5. Criar Transações Financeiras (Opcional, mas útil)
    await prisma.transaction.create({
        data: {
            description: 'Pagamento Sessão João',
            amount: 150.0,
            type: TransactionTypeEnum.REVENUE,
            payments: {
                create: {
                    method: 'PIX',
                    amount: 150.0,
                },
            },
        },
    });
    console.log('Dados de exemplo financeiros criados.');

    console.log('Seeding concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
