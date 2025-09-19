import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { Table, TableProvider } from '@lib/utils/table/Table';
import type { Column, RowProps } from '@lib/utils/table/Table';
import { format } from 'date-fns';

// Example type for dashboard data (adjust based on your API)
interface DashboardSummary {
    id: number;
    type: 'user' | 'subject' | 'task';
    name: string;
    status: string;
    created_at: string;
}

export const Route = createFileRoute('/_authenticated/dashboard')({
    component: DashboardComponent,
});

function DashboardComponent() {
    const { getToken } = useAuth();
    const navigate = useNavigate();
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

    // Data fetcher for dashboard summary
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

        const url = `${host}/admin/dashboard/summary?${query}`; // Adjust endpoint as needed
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
    const summaryColumns: Column<DashboardSummary>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'type', label: 'Type', sortable: true, filterable: true },
        { key: 'name', label: 'Name', sortable: true, filterable: true },
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
            key: 'created_at',
            label: 'Created At',
            sortable: true,
            render: (value) => format(new Date(value), 'PPP p'),
        },
    ];

    // Row props
    const getSummaryRowProps = (row: DashboardSummary): RowProps<DashboardSummary> => ({
        className: row.status === 'rejected' ? 'rejected-row' : row.status === 'approved' ? 'approved-row' : 'pending-row',
        onClick: () => {
            if (row.type === 'user') navigate({ to: `/users/${row.id}` });
            if (row.type === 'subject') navigate({ to: `/subjects/${row.id}` });
            if (row.type === 'task') navigate({ to: `/tasks/${row.id}` });
        },
    });

    return (
        <div className="route-container">
            <h1>Dojo Training Dashboard</h1>
            <TableProvider tableId="dashboard-summary-table">
                <Table<DashboardSummary>
                    tableId="dashboard-summary-table"
                    dataFetcher={dataFetcher}
                    columns={summaryColumns}
                    getRowProps={getSummaryRowProps}
                    pageSize={10}
                    showToolbar
                    showPagination
                    className="dashboard-table"
                />
            </TableProvider>
        </div>
    );
}