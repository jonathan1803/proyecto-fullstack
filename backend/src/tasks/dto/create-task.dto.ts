import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../enums/task-priority.enum';
import { IsNotPastDate } from '../validators/is-not-past-date.validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Revisión Urgente del servidor de base de datos',
    description:
      'Título de la tarea. Si incluye la palabra "Urgente" (sin distinguir mayúsculas/minúsculas), el backend asignará automáticamente la prioridad Alta.',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El título de la tarea es requerido.' })
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres.' })
  title: string;

  @ApiPropertyOptional({
    example: 'Verificar logs de conexión y optimizar índices para mitigar latencia.',
    description: 'Descripción detallada de la tarea a realizar.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  description?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIA,
    default: TaskPriority.MEDIA,
    description:
      'Prioridad sugerida por el cliente (Baja, Media, Alta). Nota: Si el título contiene "Urgente", el backend sobreescribirá este valor forzando prioridad Alta.',
  })
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'La prioridad debe ser una de las siguientes opciones: Baja, Media, Alta.',
  })
  priority?: TaskPriority;

  @ApiProperty({
    example: '2026-10-25',
    description:
      'Fecha límite en formato YYYY-MM-DD. No puede ser anterior a la fecha actual. Se permite el día actual.',
  })
  @IsNotEmpty({ message: 'La fecha límite es requerida.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha límite debe tener el formato YYYY-MM-DD.',
  })
  @IsNotPastDate({
    message: 'La fecha límite no puede ser anterior a la fecha actual.',
  })
  dueDate: string;
}
