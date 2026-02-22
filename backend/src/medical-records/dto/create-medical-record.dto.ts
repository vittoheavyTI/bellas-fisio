import { IsNotEmpty, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  @IsNotEmpty({ message: 'Tipo da ficha é obrigatório' })
  type: string; // EVALUATION ou EVOLUTION

  @IsString()
  @IsNotEmpty({ message: 'Conteúdo clínico é obrigatório' })
  content: string;

  @IsString()
  @IsOptional()
  clinicalData?: string; // JSON string

  @IsString()
  @IsOptional()
  attachments?: string;

  @IsUUID(4, { message: 'ID de agendamento inválido' })
  @IsOptional()
  appointmentId?: string;

  @IsUUID(4, { message: 'ID de paciente inválido' })
  @IsNotEmpty({ message: 'ID de paciente é obrigatório' })
  patientId: string;
}
