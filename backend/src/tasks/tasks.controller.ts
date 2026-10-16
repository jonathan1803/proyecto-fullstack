import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@ApiTags('Tareas (Tasks)')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una nueva tarea (RF-01, RF-02, RF-03)',
    description:
      'Registra una tarea en el sistema. Si el título contiene la palabra "Urgente" (sin distinguir mayúsculas/minúsculas), el backend asigna automáticamente prioridad Alta. La fecha límite no puede ser anterior a hoy.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tarea registrada con éxito.',
    type: Task,
  })
  @ApiBadRequestResponse({
    description:
      'Error de validación (HTTP 400). Por ejemplo, fecha límite anterior al día actual o campos requeridos ausentes.',
  })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar listado de tareas activas (RF-04)',
    description:
      'Devuelve el listado de tareas que no han sido eliminadas lógicamente (soft deleted), ordenadas por fecha límite y creación.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado de tareas recuperado.',
    type: [Task],
  })
  async findAll(): Promise<Task[]> {
    return await this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una tarea por ID',
    description: 'Recupera la información de una tarea específica mediante su UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la tarea',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarea encontrada.',
    type: Task,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la tarea especificada.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return await this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una tarea existente',
    description: 'Actualiza los campos de una tarea por su ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la tarea a actualizar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarea actualizada exitosamente.',
    type: Task,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una tarea mediante Soft Delete (RF-05)',
    description:
      'Aplica una eliminación lógica asignando fecha a deletedAt. La tarea deja de figurar en el listado activo pero se preserva la integridad histórica.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la tarea a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarea eliminada lógicamente.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tarea eliminada exitosamente.' },
        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la tarea a eliminar.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string; id: string }> {
    return await this.tasksService.remove(id);
  }
}
