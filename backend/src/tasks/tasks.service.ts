import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority } from './enums/task-priority.enum';
import { isDateNotBeforeToday } from './validators/is-not-past-date.validator';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * RF-01, RF-02, RF-03:
   * Registra una tarea aplicando:
   * 1. Validación de fecha límite (no anterior a hoy -> HTTP 400).
   * 2. Regla de negocio de prioridad automática: Si el título contiene "Urgente" (case-insensitive),
   *    asigna prioridad 'Alta' con precedencia absoluta sobre cualquier valor enviado por el cliente.
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // RF-03: Validación defensiva a nivel de servicio
    if (!isDateNotBeforeToday(createTaskDto.dueDate)) {
      throw new BadRequestException(
        'La fecha límite no puede ser anterior a la fecha actual.',
      );
    }

    // RF-02: Asignación automática de prioridad
    const isUrgent = /urgente/i.test(createTaskDto.title);
    const resolvedPriority = isUrgent
      ? TaskPriority.ALTA
      : (createTaskDto.priority || TaskPriority.MEDIA);

    const task = this.taskRepository.create({
      ...createTaskDto,
      priority: resolvedPriority,
    });

    return await this.taskRepository.save(task);
  }

  /**
   * RF-04:
   * Consulta todas las tareas activas (no eliminadas lógicamente).
   * TypeORM omite automáticamente los registros con deletedAt != null.
   */
  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find({
      order: {
        dueDate: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Consulta una tarea específica por su ID.
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`No se encontró la tarea con ID ${id}`);
    }

    return task;
  }

  /**
   * Actualiza una tarea existente.
   * Si el título cambia y contiene "Urgente", se recalcula la prioridad a 'Alta'.
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.dueDate && !isDateNotBeforeToday(updateTaskDto.dueDate)) {
      throw new BadRequestException(
        'La fecha límite no puede ser anterior a la fecha actual.',
      );
    }

    let resolvedPriority = updateTaskDto.priority ?? task.priority;
    const effectiveTitle = updateTaskDto.title ?? task.title;

    if (/urgente/i.test(effectiveTitle)) {
      resolvedPriority = TaskPriority.ALTA;
    }

    const updatedTask = this.taskRepository.merge(task, {
      ...updateTaskDto,
      priority: resolvedPriority,
    });

    return await this.taskRepository.save(updatedTask);
  }

  /**
   * RF-05:
   * Eliminación lógica (Soft Delete).
   * Registra la fecha en deletedAt en la base de datos sin destruir el registro físico.
   */
  async remove(id: string): Promise<{ success: boolean; message: string; id: string }> {
    const task = await this.findOne(id);
    await this.taskRepository.softDelete(id);

    return {
      success: true,
      message: `Tarea "${task.title}" eliminada exitosamente.`,
      id,
    };
  }
}
