import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { Table, TableProvider } from '@lib/utils/table/Table';
import type { Column, RowProps } from '@lib/utils/table/Table';
import { format } from 'date-fns'; 

interface User {
    id: number;
    email: string;
    name: string;
    google_id: string;
    role: string;
    status: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export const Route = createFileRoute('/_authenticated/users/')({
    component: UsersComponent,
});

function UsersComponent() {
    const { getToken } = useAuth();
    const host = import.meta.env.VITE_HOST_URL;

    // Operator mapping for API
    const mapOperator = (op: string) => {
        switch (op) {
            case 'equals': return 'eq';
            case 'contains': return 'contains';
            case 'greater than': return 'gt';
            case 'less than': return 'lt';
            default: return op;
        }
    };

    // Data fetcher
    const dataFetcher = async (params: {
        page: number;
        pageSize: number;
        sorts: { column: string; direction: 'asc' | 'desc' }[];
        filters: { column: string; operator: string; value: string }[];
    }) => {
        const token = getToken();
        if (!token) throw new Error('No auth token');

        const query = new URLSearchParams({
            page: (params.page + 1).toString(), // API 1-based
            pageSize: params.pageSize.toString(),
        });

        if (params.sorts.length) {
            query.append('sort', params.sorts.map(s => `${s.column}:${s.direction}`).join(','));
        }

        if (params.filters.length) {
            query.append('filter', params.filters.map(f => `${f.column}:${mapOperator(f.operator)}:${f.value}`).join(','));
        }

        const url = `${host}/admin/users/?${query}`;
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error('Fetch error');
        const json = await res.json();
        return {
            records: json.records,
            total_count: json.total_count,
            last_page: json.last_page,
        };
    };

    // Columns definition
    const userColumns: Column<User>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'email', label: 'Email', sortable: true, filterable: true },
        { key: 'role', label: 'Role', sortable: true, filterable: true },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            render: (value) => (
                <span style={{ color: value === 'approved' ? 'green' : value === 'pending' ? 'orange' : 'red' }}>
                    {value}
                </span>
            ),
        },
        {
            key: 'avatar_url',
            label: 'Avatar',
            render: (value) => value ? <img src={value} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }} /> : 'No Avatar',
        },
        {
            key: 'created_at',
            label: 'Created At',
            sortable: true,
            render: (value) => format(new Date(value), 'PPP p'),
        },
        {
            key: 'updated_at',
            label: 'Updated At',
            sortable: true,
            render: (value) => format(new Date(value), 'PPP p'),
        },
    ];

    // Row props
    const getUserRowProps = (row: User): RowProps<User> => ({
        className: row.status === 'rejected' ? 'rejected-row' : row.status === 'approved' ? 'approved-row' : 'pending-row',
        onClick: () => console.log('Clicked user:', row), // Can navigate to detail
    });

    return (
        <div className="route-container">
            <h1>Users</h1>
            <TableProvider tableId="users-table">
                <Table<User>
                    tableId="users-table"
                    dataFetcher={dataFetcher}
                    columns={userColumns}
                    getRowProps={getUserRowProps}
                    pageSize={10}
                    showToolbar
                    showPagination
                    className="users-table"
                />
            </TableProvider>
        </div>
    );
}