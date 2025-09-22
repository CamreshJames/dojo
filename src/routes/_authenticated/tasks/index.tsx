// src/routes/_authenticated/tasks/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, TableProvider, type Column } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';

interface TaskRow {
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
}

function TasksIndex() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
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

      const response = await fetch(`${import.meta.env.VITE_HOST_URL}/admin/tasks?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const result = await response.json();
      setData(result.records);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const columns: Column<TaskRow>[] = [
    { key: 'id', label: 'ID', sortable: true, filterable: true },
    { key: 'title', label: 'Title', sortable: true, filterable: true },
    { key: 'description', label: 'Description', filterable: true },
    { key: 'due_date', label: 'Due Date', sortable: true },
    { key: 'max_score', label: 'Max Score', sortable: true },
    {
      key: 'is_active',
      label: 'Active',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={{ color: value ? 'hsl(12, 100%, 50%)' : 'gray' }}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    { key: 'created_by_name', label: 'Created By', sortable: true, filterable: true },
    { key: 'created_at', label: 'Created At', sortable: true },
    { key: 'updated_at', label: 'Updated At', sortable: true },
  ];

  const getRowProps = (row: TaskRow) => ({
    onClick: () => navigate({ to: `/tasks/${row.id}` }),
    className: !row.is_active ? 'row-inactive' : '',
  });

  const handleRefresh = () => {
    setLoading(true);
    fetchTasks();
  };

  return (
    <div className="tasks-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Tasks</h1>
      <TableProvider tableId="tasks-table" initialPageSize={10}>
        <Table<TaskRow>
          tableId="tasks-table"
          data={data}
          columns={columns}
          onRefresh={handleRefresh}
          getRowProps={getRowProps}
        />
      </TableProvider>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/tasks/')({
  component: TasksIndex,
});