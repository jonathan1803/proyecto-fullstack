import React, { useState, useMemo } from 'react';
import type { Task, TaskPriority } from '../types/task';
import { DeleteModal } from './DeleteModal';
import {
  Search,
  Trash2,
  Calendar,
  Clock,
  Flame,
  Inbox,
  AlertCircle,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onDeleteTask: (id: string) => Promise<void>;
  deletingId: string | null;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onDeleteTask,
  deletingId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'Todas' | TaskPriority>('Todas');
  const [selectedTaskToDelete, setSelectedTaskToDelete] = useState<Task | null>(null);
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fecha de hoy para comparar vencimiento
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

  // Filtrado y búsqueda
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'Todas' ? true : task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

  const handleOpenDelete = (task: Task) => {
    setSelectedTaskToDelete(task);
    setIsDeletingModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTaskToDelete) return;
    setModalLoading(true);
    try {
      await onDeleteTask(selectedTaskToDelete.id);
      setIsDeletingModalOpen(false);
      setSelectedTaskToDelete(null);
    } finally {
      setModalLoading(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="panel-card" style={{ flex: 1 }}>
      <div className="panel-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="panel-title">
              <Inbox size={22} className="text-accent" />
              Listado de Tareas
            </h2>
            <p className="panel-desc">
              Consulta, filtrado y acciones de tareas activas.
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mostrando <strong>{filteredTasks.length}</strong> de <strong>{tasks.length}</strong>
          </span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="list-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {(['Todas', 'Alta', 'Media', 'Baja'] as const).map((filter) => (
            <button
              key={filter}
              className={`filter-tab ${priorityFilter === filter ? 'active' : ''}`}
              onClick={() => setPriorityFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <div className="status-dot" style={{ display: 'inline-block', width: '12px', height: '12px', marginBottom: '0.5rem' }}></div>
          <div>Cargando tareas sincronizadas con PostgreSQL...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <Inbox className="empty-icon" />
          <h3 className="empty-title">
            {tasks.length === 0 ? 'No hay tareas registradas' : 'No se encontraron resultados'}
          </h3>
          <p className="empty-desc">
            {tasks.length === 0
              ? 'Comienza agregando tu primera tarea en el panel izquierdo. Prueba escribiendo la palabra "Urgente" en el título.'
              : 'Intenta ajustar los términos de búsqueda o los filtros de prioridad.'}
          </p>
        </div>
      ) : (
        <div className="tasks-wrapper">
          {filteredTasks.map((task) => {
            const isAlta = task.priority === 'Alta';
            const isDueToday = task.dueDate === todayStr;
            const isItemDeleting = deletingId === task.id;

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`task-card ${isAlta ? 'priority-alta' : ''} ${
                  isItemDeleting ? 'deleting' : ''
                }`}
              >
                <div className="task-info">
                  <div className="task-header-row">
                    <span className="task-title">{task.title}</span>

                    {/* RF-06: Indicador destacado para prioridad Alta */}
                    <span
                      className={`priority-badge ${
                        task.priority.toLowerCase() as 'alta' | 'media' | 'baja'
                      }`}
                    >
                      {isAlta && <Flame size={12} />}
                      {task.priority}
                    </span>

                    {/* Badge de vencimiento */}
                    <span
                      className={`due-badge ${isDueToday ? 'due-today' : 'due-normal'}`}
                    >
                      <Calendar size={13} />
                      {isDueToday ? '¡Vence Hoy!' : formatDateDisplay(task.dueDate)}
                    </span>
                  </div>

                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-meta-row">
                    <span className="task-meta-item">
                      <Clock size={13} />
                      Creada: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    {/urgente/i.test(task.title) && (
                      <span
                        className="task-meta-item"
                        style={{ color: '#f87171', fontWeight: 600 }}
                      >
                        <AlertCircle size={13} /> Regla Urgente Aplicada
                      </span>
                    )}
                  </div>
                </div>

                {/* RF-05: Acción de eliminación */}
                <button
                  type="button"
                  className="btn-delete"
                  title="Eliminar tarea (Soft Delete)"
                  onClick={() => handleOpenDelete(task)}
                  disabled={isItemDeleting}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación de eliminación (RF-05) */}
      <DeleteModal
        task={selectedTaskToDelete}
        isOpen={isDeletingModalOpen}
        onClose={() => setIsDeletingModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={modalLoading}
      />
    </div>
  );
};
