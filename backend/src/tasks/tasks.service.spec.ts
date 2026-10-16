import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskPriority } from './enums/task-priority.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { formatDateYMD } from './validators/is-not-past-date.validator';

describe('TasksService (TaskAI Business Rules)', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockTaskRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((task) =>
      Promise.resolve({
        id: 'mock-uuid-1234',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...task,
      }),
    ),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    merge: jest.fn().mockImplementation((entity, dto) => ({ ...entity, ...dto })),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
    jest.clearAllMocks();
  });

  describe('RF-02: Asignación automática de prioridad', () => {
    it('debe asignar prioridad ALTA si el título contiene "Urgente" (en mayúsculas/minúsculas)', async () => {
      const today = formatDateYMD(new Date());
      const dto = {
        title: 'Revisión urgente de base de datos',
        description: 'Verificar réplica',
        priority: TaskPriority.BAJA, // El cliente envió BAJA
        dueDate: today,
      };

      const result = await service.create(dto);

      expect(result.priority).toBe(TaskPriority.ALTA);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: TaskPriority.ALTA,
        }),
      );
    });

    it('debe respetar la prioridad del cliente si el título NO contiene "urgente"', async () => {
      const today = formatDateYMD(new Date());
      const dto = {
        title: 'Actualizar documentación técnica',
        description: 'Documentar endpoints',
        priority: TaskPriority.BAJA,
        dueDate: today,
      };

      const result = await service.create(dto);

      expect(result.priority).toBe(TaskPriority.BAJA);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: TaskPriority.BAJA,
        }),
      );
    });

    it('debe asignar prioridad MEDIA por defecto si no se especifica y no es urgente', async () => {
      const today = formatDateYMD(new Date());
      const dto = {
        title: 'Revisión general de código',
        description: 'Code review estándar',
        dueDate: today,
      };

      const result = await service.create(dto);

      expect(result.priority).toBe(TaskPriority.MEDIA);
    });

    it('debe detectar "URGENTE" en mayúsculas sostenidas', async () => {
      const today = formatDateYMD(new Date());
      const dto = {
        title: 'FALLO EN PRODUCCIÓN URGENTE',
        description: 'Caída de API',
        dueDate: today,
      };

      const result = await service.create(dto);
      expect(result.priority).toBe(TaskPriority.ALTA);
    });

    it('debe detectar "urgente" cuando está en medio de otras palabras', async () => {
      const today = formatDateYMD(new Date());
      const dto = {
        title: 'Revisar informe urgente del cliente',
        description: 'Revisión prioritaria',
        dueDate: today,
      };

      const result = await service.create(dto);
      expect(result.priority).toBe(TaskPriority.ALTA);
    });
  });

  describe('RF-03: Validación de fecha límite', () => {
    it('debe permitir crear una tarea cuya fecha límite sea la fecha de hoy', async () => {
      const today = formatDateYMD(new Date());
      const dto = {
        title: 'Completar evaluación hoy',
        description: 'Entrega en el día actual',
        dueDate: today,
      };

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(result.dueDate).toBe(today);
    });

    it('debe permitir crear una tarea con fecha límite futura', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDateStr = formatDateYMD(futureDate);

      const dto = {
        title: 'Lanzamiento del sprint',
        description: 'Próxima semana',
        dueDate: futureDateStr,
      };

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(result.dueDate).toBe(futureDateStr);
    });

    it('debe lanzar BadRequestException (HTTP 400) si la fecha límite es anterior a hoy', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const pastDateStr = formatDateYMD(pastDate);

      const dto = {
        title: 'Tarea del pasado',
        description: 'No debería permitirse',
        dueDate: pastDateStr,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('RF-05: Eliminación lógica (Soft Delete)', () => {
    it('debe ejecutar softDelete cuando la tarea existe', async () => {
      const existingTask = {
        id: 'task-uuid-1',
        title: 'Tarea a eliminar',
        priority: TaskPriority.MEDIA,
        dueDate: '2026-10-30',
      } as Task;

      mockTaskRepository.findOne.mockResolvedValue(existingTask);

      const result = await service.remove('task-uuid-1');

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-uuid-1' },
      });
      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith('task-uuid-1');
      expect(result.success).toBe(true);
      expect(result.id).toBe('task-uuid-1');
    });

    it('debe lanzar NotFoundException si la tarea no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTaskRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
