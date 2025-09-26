import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, type Column } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { useFetch } from '@lib/utils/useApiHooks';
import { useCallback } from 'react';

interface SubjectRow {
  id: number;
  name: string;
  description: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_name: string;
}

function SubjectsIndex() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const token = getToken();

  // Always call useFetch, but skip if no token
  const { data, loading, error, refetch } = useFetch<{ records: SubjectRow[] }>(
    '/admin/subjects?page=1&pageSize=5',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: token || undefined, // Ensure token is string or undefined
      skip: !token,
    }
  );

  const columns: Column<SubjectRow>[] = [
    { key: 'id', label: 'ID', sortable: true, filterable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'description', label: 'Description', filterable: true },
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

  const getRowProps = (row: SubjectRow) => ({
    onClick: () => navigate({ to: `/subjects/${row.id}` }),
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
    <div className="subjects-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--primary)' }}>Subjects</h1>
        <button
          onClick={() => navigate({ to: '/subjects/create' })}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'hsl(12, 100%, 50%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: 'clamp(0.8125rem, 2vw, 0.875rem)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgb(26, 99, 116)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'hsl(12, 100%, 50%)'}
        >
          Create Subject
        </button>
      </div>
      <Table<SubjectRow>
        tableId="subjects-table"
        data={records}
        columns={columns}
        onRefresh={handleRefresh}
        getRowProps={getRowProps}
        initialPageSize={10}
      />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/subjects/')({
  component: SubjectsIndex,
});