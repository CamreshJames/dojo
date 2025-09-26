import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useFetch, useMutate } from '@lib/utils/useApiHooks';
import EditableField from '@lib/components/EditableField';
import { useState, useCallback, useEffect } from 'react';
import { type Subject } from '@lib/types/types';

function SubjectDetail() {
  const { subjectId } = useParams({ from: '/_authenticated/subjects/$subjectId' });
  const navigate = useNavigate();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const isValidSubjectId = !isNaN(parseInt(subjectId));

  const { data, loading, error, refetch } = useFetch<{ subject: Subject }>(
    isValidSubjectId ? `/admin/subjects/${subjectId}` : '',
    {
      baseUrl: '/api',
      token: import.meta.env.VITE_ADMIN_BEARER_TOKEN,
      skip: !isValidSubjectId,
    }
  );
  const subject = data?.subject;

  const { mutate, error: mutateError, loading: mutateLoading } = useMutate<Subject>(
    `/admin/subjects/${subjectId}`,
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
    (field: keyof Subject) => async (value: any): Promise<boolean> => {
      if (!subject || !isValidSubjectId) {
        setMutationError('Invalid subject ID or no subject data');
        return false;
      }

      const patchedValue = field === 'is_active' ? value === 'true' : value;
      console.log(`Updating field ${field} with value:`, patchedValue);

      const payload = {
        name: field === 'name' ? patchedValue : subject.name,
        description: field === 'description' ? patchedValue : subject.description,
        is_active: field === 'is_active' ? patchedValue : subject.is_active,
      };

      const success = await mutate(payload, 'PUT');
      if (!success) {
        setMutationError(mutateError || `Failed to update ${field}: Invalid input data`);
      } else {
        await refetch();
      }
      return success;
    },
    [subject, isValidSubjectId, mutate, mutateError, refetch]
  );

  if (!isValidSubjectId) {
    return (
      <div className="error" style={{
        padding: '1rem',
        background: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        margin: '1rem',
        textAlign: 'center',
      }}>
        Error: Invalid subject ID
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
        <p>Loading subject data...</p>
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

  if (!subject) {
    return (
      <div className="not-found" style={{ textAlign: 'center', padding: '2rem' }}>
        Subject not found
      </div>
    );
  }

  const activeOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  return (
    <div className="subject-detail" style={{
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
          Error updating subject: {mutationError}
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
          Updating subject...
        </div>
      )}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: 0 }}>
          <EditableField
            value={subject.name}
            onSave={handleFieldUpdate('name')}
            validation={(value) => !value ? 'Name is required' : null}
          />
        </h1>
        <button
          onClick={() => navigate({ to: '/subjects' })}
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
          Back to Subjects
        </button>
      </div>

      <div className="subject-card" style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '2rem',
      }}>
        <div className="status-section" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <EditableField
            value={subject.is_active.toString()}
            onSave={handleFieldUpdate('is_active')}
            type="select"
            options={activeOptions}
          />
        </div>

        <div className="details-section">
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Description</h3>
            <EditableField
              value={subject.description || ''}
              onSave={handleFieldUpdate('description')}
              type="textarea"
            />
          </div>
          
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Created By</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{subject.created_by_name}</p>
          </div>
          
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Created</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{new Date(subject.created_at).toLocaleString()}</p>
          </div>
          
          <div className="detail-item">
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Updated</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{new Date(subject.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/subjects/$subjectId')({
  component: SubjectDetail,
});