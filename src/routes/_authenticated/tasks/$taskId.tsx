// src/routes/_authenticated/tasks/$taskId.tsx
import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface Task {
  id: number;
  subject_id: number;
  title: string;
  description: string;
  requirements: string;
  due_date: string;
  max_score: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  subject_name?: string; // Optional subject name from response
}

function TaskDetail() {
  const { taskId } = useParams({ from: '/_authenticated/tasks/$taskId' });
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      const token = getToken();
      if (!token) {
        setError('No auth token');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_HOST_URL}/admin/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch task');
        const data = await response.json();
        setTask(data.task); // Extract nested task object from response
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, getToken]);

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid #ddd',
          borderTop: '3px solid hsl(12, 100%, 50%)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }}></div>
        <p>Loading task data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{
        padding: '1rem',
        background: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        margin: '1rem',
        textAlign: 'center',
      }}>
        Error: {error}
      </div>
    );
  }

  if (!task) {
    return (
      <div className="not-found" style={{ textAlign: 'center', padding: '2rem' }}>
        Task not found
      </div>
    );
  }

  return (
    <div className="task-detail" style={{
      '--primary': 'hsl(12, 100%, 50%)',
      '--primary-light': 'hsl(12, 100%, 90%)',
      '--primary-dark': 'hsl(12, 100%, 30%)',
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '0 1rem',
    } as React.CSSProperties}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: 0 }}>
          {task.title}
        </h1>
        <button
          onClick={() => navigate({ to: '/tasks' })}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'var(--primary-dark)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'var(--primary)')}
        >
          Back to Tasks
        </button>
      </div>

      <div className="task-card" style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '2rem',
      }}>
        <div className="status-section" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            background: task.is_active ? 'var(--primary-light)' : '#f8d7da',
            color: task.is_active ? 'var(--primary-dark)' : '#721c24',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}>
            {task.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="details-section">
          {task.subject_name && (
            <div className="detail-item" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Subject</h3>
              <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{task.subject_name}</p>
            </div>
          )}
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Description</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{task.description || 'No description'}</p>
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Requirements</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{task.requirements || 'No requirements'}</p>
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Due Date</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{new Date(task.due_date).toLocaleString()}</p>
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Max Score</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{task.max_score}</p>
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Created By</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{task.created_by_name}</p>
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Created</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{new Date(task.created_at).toLocaleString()}</p>
          </div>
          <div className="detail-item">
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Updated</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{new Date(task.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/tasks/$taskId')({
  component: TaskDetail,
});