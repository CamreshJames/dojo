import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { createApiClient } from '@lib/utils/api';
import EditableField from '@lib/components/EditableField';

interface Subject {
  id: number;
  name: string;
  description: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_name: string;
}

function SubjectDetail() {
  const { subjectId } = useParams({ from: '/_authenticated/subjects/$subjectId' });
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = createApiClient(import.meta.env.VITE_HOST_URL);

  useEffect(() => {
    const fetchSubject = async () => {
      const token = getToken();
      if (!token) {
        setError('No auth token');
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/admin/subjects/${subjectId}`, { token });
      
      if (response.success) {
        setSubject(response.data.subject);
      } else {
        setError(response.error || 'Failed to fetch subject');
      }
      setLoading(false);
    };
    
    fetchSubject();
  }, [subjectId, getToken]);

  const handleFieldUpdate = (field: keyof Subject) => async (value: any): Promise<boolean> => {
    if (!subject) return false;
    
    const token = getToken();
    if (!token) return false;

    const response = await apiClient.patch(`/admin/subjects/${subjectId}`, 
      { [field]: value }, 
      { token }
    );

    if (response.success) {
      setSubject(prev => prev ? { ...prev, [field]: value } : null);
      return true;
    }
    
    return false;
  };

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
            value={String(subject.is_active)}
            onSave={(value) => handleFieldUpdate('is_active')(value === 'true')}
            type="select"
            options={activeOptions}
          />
        </div>

        <div className="details-section">
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Description</h3>
            <EditableField
              value={subject.description || 'No description'}
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