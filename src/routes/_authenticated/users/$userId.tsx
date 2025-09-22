// src/routes/_authenticated/users/$userId.tsx
import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { createApiClient } from '@lib/utils/api';
import EditableField from '@lib/components/EditableField';

interface User {
  id: number;
  email: string;
  name: string;
  google_id?: string;
  role: string;
  status: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

function UserDetail() {
  const { userId } = useParams({ from: '/_authenticated/users/$userId' });
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = createApiClient(import.meta.env.VITE_HOST_URL);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setError('No auth token');
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/admin/users/${userId}`, { token });
      
      if (response.success) {
        setUser(response.data.user);
      } else {
        setError(response.error || 'Failed to fetch user');
      }
      setLoading(false);
    };
    
    fetchUser();
  }, [userId, getToken]);

  const handleFieldUpdate = (field: keyof User) => async (value: any): Promise<boolean> => {
    if (!user) return false;
    
    const token = getToken();
    if (!token) return false;

    const response = await apiClient.patch(`/admin/users/${userId}`, 
      { [field]: value }, 
      { token }
    );

    if (response.success) {
      setUser(prev => prev ? { ...prev, [field]: value } : null);
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
        <p>Loading user data...</p>
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

  if (!user) {
    return (
      <div className="not-found" style={{ textAlign: 'center', padding: '2rem' }}>
        User not found
      </div>
    );
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
  ];

  return (
    <div className="user-detail" style={{
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
          {user.name}'s Profile
        </h1>
        <button
          onClick={() => navigate({ to: '/users' })}
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
          Back to Users
        </button>
      </div>

      <div className="user-card" style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '2rem',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        <div className="avatar-section" style={{ textAlign: 'center', flex: '0 0 200px' }}>
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`${user.name}'s avatar`}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '2px solid var(--primary-light)',
                objectFit: 'cover',
                marginBottom: '1rem',
              }}
            />
          ) : (
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-dark)',
              fontSize: '2rem',
              margin: '0 auto 1rem',
            }}>
              {user.name[0]}
            </div>
          )}
          <EditableField
            value={user.status}
            onSave={handleFieldUpdate('status')}
            type="select"
            options={statusOptions}
          />
        </div>

        <div className="details-section" style={{ flex: '1', minWidth: '250px' }}>
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Name</h3>
            <EditableField
              value={user.name}
              onSave={handleFieldUpdate('name')}
              validation={(value) => !value ? 'Name is required' : null}
            />
          </div>
          
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Email</h3>
            <EditableField
              value={user.email}
              onSave={handleFieldUpdate('email')}
              type="email"
              validation={(value) => {
                if (!value) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
                return null;
              }}
            />
          </div>
          
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Role</h3>
            <EditableField
              value={user.role}
              onSave={handleFieldUpdate('role')}
              type="select"
              options={roleOptions}
            />
          </div>
          
          {user.google_id && (
            <div className="detail-item" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Google ID</h3>
              <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{user.google_id}</p>
            </div>
          )}
          
          <div className="detail-item" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Created</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{new Date(user.created_at).toLocaleString()}</p>
          </div>
          
          <div className="detail-item">
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Updated</h3>
            <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{new Date(user.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetail,
});