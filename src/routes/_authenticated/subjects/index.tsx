import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, type Column } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';

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
  const [data, setData] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('No auth token');
      setLoading(false);
      return;
    }

    try {
      const query = new URLSearchParams({
        page: '1',
        pageSize: '5',
      });

      const response = await fetch(`${import.meta.env.VITE_HOST_URL}/admin/subjects?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch subjects');

      const result = await response.json();
      setData(result.records);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const columns: Column<SubjectRow>[] = [
    { key: 'id', label: 'ID', sortable: true, filterable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'description', label: 'Description', filterable: true },
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
    // { key: 'created_at', label: 'Created At', sortable: true },
    // { key: 'updated_at', label: 'Updated At', sortable: true },
  ];

  const getRowProps = (row: SubjectRow) => ({
    onClick: () => navigate({ to: `/subjects/${row.id}` }),
    className: !row.is_active ? 'row-inactive' : '',
  });

  const handleRefresh = () => {
    setLoading(true);
    fetchSubjects();
  };

  return (
    <div className="subjects-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Subjects</h1>
        <Table<SubjectRow>
          tableId="subjects-table"
          data={data}
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