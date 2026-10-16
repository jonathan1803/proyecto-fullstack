import React from 'react';
import type { Task } from '../types/task';
import { CheckCircle2, Flame, AlertTriangle, Calendar } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const altaCount = tasks.filter((t) => t.priority === 'Alta').length;
  const urgentTitleCount = tasks.filter((t) => /urgente/i.test(t.title)).length;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const dueTodayCount = tasks.filter((t) => t.dueDate === todayStr).length;

  return (
    <div className="stats-grid">
      <div className="stat-card total">
        <div className="stat-icon-wrapper">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total de Tareas</div>
        </div>
      </div>

      <div className="stat-card alta">
        <div className="stat-icon-wrapper">
          <Flame size={24} />
        </div>
        <div>
          <div className="stat-value">{altaCount}</div>
          <div className="stat-label">Prioridad Alta</div>
        </div>
      </div>

      <div className="stat-card urgent">
        <div className="stat-icon-wrapper">
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="stat-value">{urgentTitleCount}</div>
          <div className="stat-label">Detectadas "Urgente"</div>
        </div>
      </div>

      <div className="stat-card today">
        <div className="stat-icon-wrapper">
          <Calendar size={24} />
        </div>
        <div>
          <div className="stat-value">{dueTodayCount}</div>
          <div className="stat-label">Vencen Hoy</div>
        </div>
      </div>
    </div>
  );
};
