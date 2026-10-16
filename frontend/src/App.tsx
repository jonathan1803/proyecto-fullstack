import React, { useState, useEffect, useCallback } from 'react';
import type { Task } from './types/task';
import { taskApi, ApiError } from './services/api';
import { TaskStats } from './components/TaskStats';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { CheckSquare, ExternalLink, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      showToast(
        'No se pudo conectar con la API de TaskAI en http://localhost:3000/api.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // RF-06: Incorporación dinámica al listado sin recargar
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // RF-05 & RF-06: Eliminación con animación de desaparición y soft delete
  const handleDeleteTask = async (id: string) => {
    try {
      // Activar clase CSS de animación de salida en el elemento específico
      setDeletingId(id);

      // Esperar a que la animación de salida (350ms) termine visualmente
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Llamada a la API (Soft Delete en PostgreSQL)
      await taskApi.deleteTask(id);

      // Remover del estado local reactivo sin recargar la página
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Tarea archivada mediante Soft Delete exitosamente.', 'success');
    } catch (err: any) {
      if (err instanceof ApiError) {
        showToast(err.message, 'error');
      } else {
        showToast('Error al intentar eliminar la tarea.', 'error');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="app-container">
      {/* Encabezado */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <CheckSquare size={28} />
          </div>
          <div>
            <h1 className="brand-title">TaskAI</h1>
            <p className="brand-subtitle">
              Sistema de Gestión de Tareas Inteligente &amp; Reglas de Negocio
            </p>
          </div>
        </div>

        <div className="header-badges">
          <div className="status-badge-api">
            <span className="status-dot"></span>
            <span>API Online</span>
          </div>

          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="swagger-link"
            title="Ver documentación Swagger OpenAPI interactiva"
          >
            <span>OpenAPI Docs</span>
            <ExternalLink size={14} />
          </a>

          <button
            onClick={fetchTasks}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Recargar listado desde la base de datos"
          >
            <RefreshCw size={13} />
            <span>Sincronizar</span>
          </button>
        </div>
      </header>

      {/* Métricas Principales */}
      <TaskStats tasks={tasks} />

      {/* Grid Principal: Formulario y Listado */}
      <main className="main-content-grid">
        <aside>
          <TaskForm onTaskCreated={handleTaskCreated} showToast={showToast} />
        </aside>

        <section>
          <TaskList
            tasks={tasks}
            loading={loading}
            onDeleteTask={handleDeleteTask}
            deletingId={deletingId}
          />
        </section>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
