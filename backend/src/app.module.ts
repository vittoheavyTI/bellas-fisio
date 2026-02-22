import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { FinancialModule } from './financial/financial.module';
import { PlansModule } from './plans/plans.module';
import { SystemModule } from './system/system.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        UsersModule,
        ClinicsModule,
        ProfessionalsModule,
        PatientsModule,
        AppointmentsModule,
        MedicalRecordsModule,
        FinancialModule,
        PlansModule,
        SystemModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule { }
