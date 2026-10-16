import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { TaskPriority } from '../enums/task-priority.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tasks')
export class Task {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador único de la tarea (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Preparar informe Urgente de ventas',
    description: 'Título de la tarea. Si contiene "Urgente", la prioridad se asigna automáticamente como Alta.',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    example: 'Detallar las ventas del último trimestre para la reunión con la junta directiva.',
    description: 'Descripción detallada de la tarea',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.ALTA,
    description: 'Nivel de prioridad de la tarea: Baja, Media, Alta',
  })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIA,
  })
  priority: TaskPriority;

  @ApiProperty({
    example: '2026-10-20',
    description: 'Fecha límite de cumplimiento en formato YYYY-MM-DD. No puede ser anterior a hoy.',
  })
  @Column({ type: 'date' })
  dueDate: string;

  @ApiProperty({
    example: '2026-10-16T04:30:00.000Z',
    description: 'Fecha y hora de creación del registro',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2026-10-16T04:30:00.000Z',
    description: 'Fecha y hora de última actualización',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación lógica (Soft Delete). Null si está activa.',
    nullable: true,
  })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
