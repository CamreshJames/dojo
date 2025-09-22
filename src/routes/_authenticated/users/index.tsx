// src/routes/_authenticated/users/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, TableProvider, type Column } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';

interface UserRow {
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

function UsersIndex() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('No auth token');
      setLoading(false);
      return;
    }

    try {
      const query = new URLSearchParams({
        page: '1',
        pageSize: '100',
      });

      const response = await fetch(`${import.meta.env.VITE_HOST_URL}/admin/users?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const result = await response.json();
      setData(result.records);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const columns: Column<UserRow>[] = [
    {
      key: 'avatar_url',
      label: 'Avatar',
      render: (value) => value ? <img src={value} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} /> : 'No Avatar',
    },
    { key: 'id', label: 'ID', sortable: true, filterable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'role', label: 'Role', sortable: true, filterable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor:
              value === 'approved' ? 'hsl(108, 100.00%, 43.30%)' :
              value === 'pending' ? 'hsl(15, 3.60%, 78.00%)' :
              'hsl(12, 100%, 50%)',
            color: '#fff',
          }}
        >
          {value}
        </span>
      ),
    },
    // { key: 'created_at', label: 'Created At', sortable: true },
    // { key: 'updated_at', label: 'Updated At', sortable: true },
  ];

  const getRowProps = (row: UserRow) => ({
    onClick: () => navigate({ to: `/users/${row.id}` }),
    className: row.status === 'rejected' ? 'row-rejected' : '',
  });

  const handleRefresh = () => {
    setLoading(true);
    fetchUsers();
  };

  return (
    <div className="users-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Users</h1>
      <TableProvider tableId="users-table" initialPageSize={10}>
        <Table<UserRow>
          tableId="users-table"
          data={data}
          columns={columns}
          onRefresh={handleRefresh}
          getRowProps={getRowProps}
        />
      </TableProvider>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersIndex,
});