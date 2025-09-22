// src/routes/_authenticated/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface Summary {
  users: number;
  tasks: number;
  subjects: number;
}

function Dashboard() {
  const { getToken, user } = useAuth();
  const [summary, setSummary] = useState<Summary>({ users: 0, tasks: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const [usersRes, tasksRes, subjectsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_HOST_URL}/admin/users?page=1&pageSize=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_HOST_URL}/admin/tasks?page=1&pageSize=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_HOST_URL}/admin/subjects?page=1&pageSize=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [usersData, tasksData, subjectsData] = await Promise.all([
          usersRes.json(),
          tasksRes.json(),
          subjectsRes.json(),
        ]);

        setSummary({
          users: usersData.total_count || 0,
          tasks: tasksData.total_count || 0,
          subjects: subjectsData.total_count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [getToken]);

  return (
    <div className="dashboard" style={{ '--primary': 'hsl(12, 100%, 50%)', '--primary-light': 'hsl(12, 100%, 70%), ', '--primary-dark': 'hsl(12, 100%, 30%)', '--primary-bg': 'hsl(12, 100.00%, 97.10%)'} as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Welcome, {user?.username || 'User'}!</h1>
      {loading ? (
        <p>Loading summary...</p>
      ) : (
        <div className="cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem', background: 'var(--primary-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary-dark)' }}>Total Users</h2>
            <p style={{ fontSize: '2rem', color: 'var(--primary)' }}>{summary.users}</p>
          </div>
          <div className="card" style={{ padding: '1rem', background: 'var(--primary-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary-dark)' }}>Total Tasks</h2>
            <p style={{ fontSize: '2rem', color: 'var(--primary)' }}>{summary.tasks}</p>
          </div>
          <div className="card" style={{ padding: '1rem', background: 'var(--primary-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary-dark)' }}>Total Subjects</h2>
            <p style={{ fontSize: '2rem', color: 'var(--primary)' }}>{summary.subjects}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});