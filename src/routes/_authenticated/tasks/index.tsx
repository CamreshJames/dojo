import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, type Column } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { useFetch } from '@lib/utils/useApiHooks';
import { useCallback } from 'react';

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
  const token = getToken();

  const { data, loading, error, refetch } = useFetch<{ records: TaskRow[] }>(
    '/admin/tasks?page=1&pageSize=100',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: token || undefined,
      skip: !token,
    }
  );

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
      render: (value: boolean) => (
        <span style={{ color: value ? 'hsl(12, 100%, 50%)' : 'gray' }}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    { key: 'created_by_name', label: 'Created By', sortable: true, filterable: true },
  ];

  const getRowProps = (row: TaskRow) => ({
    onClick: () => navigate({ to: `/tasks/${row.id}` }),
    className: !row.is_active ? 'row-inactive' : '',
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!token) return <div>Error: No auth token</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const records = data?.records || [];

  return (
    <div className="tasks-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Tasks</h1>
      <Table<TaskRow>
        tableId="tasks-table"
        data={records}
        columns={columns}
        onRefresh={handleRefresh}
        getRowProps={getRowProps}
        initialPageSize={5}
      />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/tasks/')({
  component: TasksIndex,
});