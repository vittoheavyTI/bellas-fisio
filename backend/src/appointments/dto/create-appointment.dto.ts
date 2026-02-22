import { IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { AppointmentStatusEnum } from '../../common/enums';

export class CreateAppointmentDto {
    @IsDateString({}, { message: 'Data/Hora de início inválida' })
    @IsNotEmpty({ message: 'Horário de início é obrigatório' })
    startTime: string;

    @IsDateString({}, { message: 'Data/Hora de término inválida' })
    @IsNotEmpty({ message: 'Horário de término é obrigatório' })
    endTime: string;

    @IsEnum(AppointmentStatusEnum)
    @IsOptional()
    status?: AppointmentStatusEnum;

    @IsUUID(4, { message: 'ID de paciente inválido' })
    @IsNotEmpty({ message: 'ID de paciente é obrigatório' })
    patientId: string;

    @IsUUID(4, { message: 'ID de profissional inválido' })
    @IsNotEmpty({ message: 'ID de profissional é obrigatório' })
    professionalId: string;

    @IsUUID(4, { message: 'ID de clínica inválido' })
    @IsNotEmpty({ message: 'ID de clínica é obrigatório' })
    clinicId: string;

    @IsUUID(4, { message: 'ID de procedimento inválido' })
    @IsOptional()
    procedureId?: string;
}
