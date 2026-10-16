import React, { useState, useMemo } from 'react';
import type { CreateTaskInput, Task, TaskPriority } from '../types/task';
import { taskApi, ApiError } from '../services/api';
import { PlusCircle, Sparkles, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  onTaskCreated: (newTask: Task) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, showToast }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Media');
  const [dueDate, setDueDate] = useState(todayStr);

  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  // RF-02: Detección visual en tiempo real de la palabra "Urgente"
  const isUrgentDetected = useMemo(() => {
    return /urgente/i.test(title);
  }, [title]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);

    // RF-03: Validación inmediata en Frontend
    if (val && val < todayStr) {
      setDateError('La fecha límite no puede ser anterior a la fecha actual.');
    } else {
      setDateError(null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (e.target.value.trim()) {
      setTitleError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError('Por favor ingresa un título para la tarea.');
      return;
    }

    // RF-03: Validación estricta de fecha límite en Frontend
    if (!dueDate || dueDate < todayStr) {
      setDateError('La fecha límite no puede ser anterior a la fecha actual.');
      showToast('Error de validación: La fecha límite no puede ser anterior a hoy.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority,
        dueDate: dueDate,
      };

      const createdTask = await taskApi.createTask(payload);

      // RF-06: Incorporación al listado sin recargar la página
      onTaskCreated(createdTask);

      // Feedback inteligente si se aplicó RF-02
      if (/urgente/i.test(createdTask.title)) {
        showToast(
          `Tarea creada. Prioridad "Alta" asignada automáticamente por contener "Urgente".`,
          'info',
        );
      } else {
        showToast(`Tarea "${createdTask.title}" registrada exitosamente.`, 'success');
      }

      // Limpiar formulario preservando fecha por defecto
      setTitle('');
      setDescription('');
      setPriority('Media');
      setDueDate(todayStr);
      setDateError(null);
      setTitleError(null);
    } catch (err: any) {
      if (err instanceof ApiError) {
        showToast(err.message, 'error');
        if (err.statusCode === 400 && err.message.toLowerCase().includes('fecha')) {
          setDateError(err.message);
        }
      } else {
        showToast('No se pudo conectar con el servidor backend.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <h2 className="panel-title">
          <PlusCircle size={22} className="text-accent" />
          Nueva Tarea
        </h2>
        <p className="panel-desc">
          Registra una tarea con evaluación inteligente de prioridad.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Título de la Tarea *
          </label>
          <input
            id="task-title"
            type="text"
            className={`form-input ${titleError ? 'has-error' : ''}`}
            placeholder="Ej: Revisión Urgente del servidor"
            value={title}
            onChange={handleTitleChange}
            maxLength={255}
            disabled={loading}
          />
          {titleError && (
            <div className="field-error">
              <AlertCircle size={14} />
              <span>{titleError}</span>
            </div>
          )}

          {/* RF-02 Hint en tiempo real */}
          {isUrgentDetected && (
            <div className="ai-smart-hint">
              <Sparkles size={16} />
              <span>
                <strong>Regla TaskAI activa:</strong> La palabra "Urgente" fue detectada.
                El backend forzará automáticamente la prioridad a <strong>Alta</strong>.
              </span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="task-desc" className="form-label">
            Descripción (Opcional)
          </label>
          <textarea
            id="task-desc"
            className="form-textarea"
            placeholder="Detalles adicionales, requisitos o enlaces..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-priority" className="form-label">
            Prioridad Solicitada
          </label>
          <select
            id="task-priority"
            className="form-select"
            value={isUrgentDetected ? 'Alta' : priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            disabled={loading || isUrgentDetected}
          >
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
          {isUrgentDetected && (
            <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem' }}>
              * Campo bloqueado: El título contiene "Urgente", el backend asigna Alta obligatoriamente.
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="task-due-date" className="form-label">
            Fecha Límite * (Hoy en adelante)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="task-due-date"
              type="date"
              min={todayStr}
              className={`form-input ${dateError ? 'has-error' : ''}`}
              value={dueDate}
              onChange={handleDateChange}
              disabled={loading}
            />
          </div>
          {dateError ? (
            <div className="field-error">
              <AlertCircle size={14} />
              <span>{dateError}</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Se permiten tareas con vencimiento hoy o fechas posteriores.
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !!dateError}
        >
          <PlusCircle size={18} />
          <span>{loading ? 'Registrando...' : 'Registrar Tarea'}</span>
        </button>
      </form>
    </div>
  );
};
