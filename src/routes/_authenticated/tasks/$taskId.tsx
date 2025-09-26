import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useFetch, useMutate } from '@lib/utils/useApiHooks';
import EditableField from '@lib/components/EditableField';
import { useState, useCallback, useEffect } from 'react';
import { type Task } from '@lib/types/types';

function TaskDetail() {
  const { taskId } = useParams({ from: '/_authenticated/tasks/$taskId' });
  const navigate = useNavigate();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const isValidTaskId = !isNaN(parseInt(taskId));

  const { data, loading, error, refetch } = useFetch<{ task: Task }>(
    isValidTaskId ? `/admin/tasks/${taskId}` : '',
    {
      baseUrl: '/api',
      token: import.meta.env.VITE_ADMIN_BEARER_TOKEN,
      skip: !isValidTaskId,
    }
  );
  const task = data?.task;

  const { mutate, error: mutateError, loading: mutateLoading } = useMutate<Task>(
    `/admin/tasks/${taskId}`,
    {
      baseUrl: '/api',
      token: import.meta.env.VITE_ADMIN_BEARER_TOKEN,
      defaultMethod: 'PUT',
    }
  );

  useEffect(() => {
    if (mutationError) {
      const timer = setTimeout(() => {
        setMutationError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mutationError]);

  const handleFieldUpdate = useCallback(
    (field: keyof Task) => async (value: any): Promise<boolean> => {
      if (!task || !isValidTaskId) {
        setMutationError('Invalid task ID or no task data');
        return false;
      }

      let patchedValue = value;
      if (field === 'is_active') {
        patchedValue = value === 'true';
      } else if (field === 'max_score') {
        patchedValue = parseInt(value, 10);
      } else if (field === 'due_date') {
        patchedValue = `${value}T00:00:00.000Z`;
      }

      console.log(`Updating field ${field} with value:`, patchedValue);

      const payload = {
        subject_id: task.subject_id,
        title: field === 'title' ? patchedValue : task.title,
        description: field === 'description' ? patchedValue : task.description,
        requirements: field === 'requirements' ? patchedValue : task.requirements,
        due_date: field === 'due_date' ? patchedValue : task.due_date,
        max_score: field === 'max_score' ? patchedValue : task.max_score,
        is_active: field === 'is_active' ? patchedValue : task.is_active,
      };

      const success = await mutate(payload, 'PUT');
      if (!success) {
        setMutationError(mutateError || `Failed to update ${field}: Invalid input data`);
      } else {
        await refetch();
      }
      return success;
    },
    [task, isValidTaskId, mutate, mutateError, refetch]
  );

  if (!isValidTaskId) {
    return (
      <div className="error" style={{
        padding: '1rem',
        background: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        margin: '1rem',
        textAlign: 'center',
      }}>
        Error: Invalid task ID
      </div>
    );
  }

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
      {mutationError && (
        <div className="mutation-error" style={{
          padding: '1rem',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          margin: '1rem 0',
          textAlign: 'center',
          transition: 'opacity 0.5s ease-out',
        }}>
          Error updating task: {mutationError}
        </div>
      )}
      {mutateLoading && (
        <div className="mutation-loading" style={{
          padding: '1rem',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          margin: '1rem 0',
          textAlign: 'center',
        }}>
          Updating task...
        </div>
      )}
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
              value={task.due_date.split('T')[0]}
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