import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { createApiClient } from '@lib/utils/api';
import EditableField from '@lib/components/EditableField';

// Interface for Task data
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
  subject_name?: string;
}

function TaskDetail() {
  const { taskId } = useParams({ from: '/_authenticated/tasks/$taskId' });
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = createApiClient(import.meta.env.VITE_HOST_URL);

  useEffect(() => {
    const fetchTask = async () => {
      const token = getToken();
      if (!token) {
        setError('No auth token');
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/admin/tasks/${taskId}`, { token });
      
      if (response.success) {
        setTask(response.data.task);
      } else {
        setError(response.error || 'Failed to fetch task');
      }
      setLoading(false);
    };
    
    fetchTask();
  }, [taskId, getToken]);

  // Handle updates to task fields
  const handleFieldUpdate = (field: keyof Task) => async (value: any): Promise<boolean> => {
    if (!task) return false;
    
    const token = getToken();
    if (!token) return false;

    // Convert string "true"/"false" to boolean for is_active
    const patchedValue = field === 'is_active' ? value === 'true' : value;

    const response = await apiClient.put(`/admin/tasks/${taskId}`, 
      { [field]: patchedValue }, 
      { token }
    );

    if (response.success) {
      setTask(prev => prev ? { ...prev, [field]: patchedValue } : null);
      return true;
    }
    
    return false;
  };

  // Loading state
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

  // Error state
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

  // Task not found state
  if (!task) {
    return (
      <div className="not-found" style={{ textAlign: 'center', padding: '2rem' }}>
        Task not found
      </div>
    );
  }

  // Options for is_active select field
  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

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
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        <div className="status-section" style={{ textAlign: 'center', flex: '0 0 200px' }}>
          <EditableField
            value={task.is_active.toString()}
            onSave={handleFieldUpdate('is_active')}
            type="select"
            options={statusOptions}
          />
        </div>

        <div className="details-section" style={{ flex: '1', minWidth: '250px' }}>
          {task.subject_name && (
            <div className="detail-item" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Subject</h3>
              <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{task.subject_name}</p>
            </div>
          )}
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Title</h3>
            <EditableField
              value={task.title}
              onSave={handleFieldUpdate('title')}
              validation={(value) => !value ? 'Title is required' : null}
            />
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Description</h3>
            <EditableField
              value={task.description || ''}
              onSave={handleFieldUpdate('description')}
              type="textarea"
            />
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Requirements</h3>
            <EditableField
              value={task.requirements || ''}
              onSave={handleFieldUpdate('requirements')}
              type="textarea"
            />
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Due Date</h3>
            <EditableField
              value={task.due_date}
              onSave={handleFieldUpdate('due_date')}
              type="date"
              validation={(value) => {
                if (!value) return 'Due date is required';
                if (new Date(value) < new Date()) return 'Due date must be in the future';
                return null;
              }}
            />
          </div>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Max Score</h3>
            <EditableField
              value={task.max_score.toString()}
              onSave={handleFieldUpdate('max_score')}
              type="number"
              validation={(value) => {
                const num = parseInt(value);
                if (isNaN(num)) return 'Score must be a number';
                if (num <= 0) return 'Score must be positive';
                return null;
              }}
            />
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