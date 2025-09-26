import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, type Column, useTableData } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { createApiClient } from '@lib/utils/api';
import { useCallback } from 'react';

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
  const token = getToken();

  const apiClient = createApiClient(import.meta.env.VITE_HOST_URL);

  const fetcher = useCallback(async (params: { page: number; pageSize: number; sorts: any[]; filters: any[]; }) => {
    if (!token) {
      return { records: [], total_count: 0, last_page: 1 };
    }
    
    const queryParams = new URLSearchParams({
      page: (params.page + 1).toString(),
      page_size: params.pageSize.toString(),
    });

    if (params.sorts.length > 0) {
      queryParams.append('sorts', JSON.stringify(params.sorts));
    }
    if (params.filters.length > 0) {
      queryParams.append('filters', JSON.stringify(params.filters));
    }

    const endpoint = `/admin/users?${queryParams.toString()}`;
    const response = await apiClient.get(endpoint, { token });

    if (response.success) {
      return {
        records: response.data.records,
        total_count: response.data.total_count,
        last_page: response.data.last_page,
      };
    }
    throw new Error(response.error || 'Failed to fetch users');
  }, [apiClient, token]);

  const {
    data, loading, error, pageCount, totalCount,
    currentPage, pageSize, sorts, filters,
    refresh, operations,
  } = useTableData<UserRow>({
    fetcher,
    enabled: !!token,
  });

  const columns: Column<UserRow>[] = [
    {
      key: 'avatar_url',
      label: 'Avatar',
      render: (value?: string) => value ? <img src={value} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} /> : 'No Avatar',
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
      render: (value: string) => (
        <span style={{
          padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff',
          backgroundColor:
            value === 'approved' ? 'hsl(108, 100.00%, 43.30%)' :
            value === 'pending' ? 'hsla(36, 68%, 23%, 1.00)' :
            'hsl(12, 100%, 50%)',
        }}>
          {value}
        </span>
      ),
    },
  ];

  const getRowProps = (row: UserRow) => ({
    onClick: () => navigate({ to: `/users/${row.id}` }),
    className: row.status === 'rejected' ? 'row-rejected' : '',
  });

  if (!token) return <div>Error: No auth token</div>;

  return (
    <div className="users-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Users</h1>
      <Table<UserRow>
        tableId="users-table"
        data={data}
        columns={columns}
        loading={loading}
        error={error}
        onRefresh={refresh}
        getRowProps={getRowProps}
        currentPage={currentPage}
        totalPages={pageCount}
        totalCount={totalCount}
        pageSize={pageSize}
        sorts={sorts}
        filters={filters}
        operations={operations}
      />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersIndex,
});