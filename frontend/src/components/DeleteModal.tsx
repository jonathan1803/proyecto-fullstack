import React, { useEffect } from 'react';
import type { Task } from '../types/task';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="modal-dialog" role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="modal-icon-danger">
            <AlertTriangle size={24} />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="modal-title">¿Eliminar esta tarea?</h3>
        <p className="modal-desc">
          Estás por eliminar <strong>"{task.title}"</strong>.
          <br />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
            ℹ️ <strong>Soft Delete (RF-05):</strong> La tarea se archivará lógicamente en la base de datos (deletedAt) y desaparecerá inmediatamente de tu pantalla.
          </span>
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};
