import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import { Table, TableProvider } from '@lib/utils/table/Table';
import type { Column, RowProps } from '@lib/utils/table/Table';
import { format } from 'date-fns';

// Define Task type
interface Task {
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

export const Route = createFileRoute('/_authenticated/tasks/')({
    component: TasksComponent,
});

function TasksComponent() {
    const { getToken } = useAuth();
    const host = import.meta.env.VITE_HOST_URL;

    const mapOperator = (op: string) => {
        switch (op) {
            case 'equals': return 'eq';
            case 'contains': return 'contains';
            case 'greater than': return 'gt';
            case 'less than': return 'lt';
            default: return op;
        }
    };

    const dataFetcher = async (params: {
        page: number;
        pageSize: number;
        sorts: { column: string; direction: 'asc' | 'desc' }[];
        filters: { column: string; operator: string; value: string }[];
    }) => {
        const token = getToken();
        if (!token) throw new Error('No auth token');

        const query = new URLSearchParams({
            page: (params.page + 1).toString(),
            page_size: params.pageSize.toString(),
        });

        if (params.sorts.length) {
            query.append('sort', params.sorts.map(s => `${s.column}:${s.direction}`).join(','));
        }

        if (params.filters.length) {
            query.append('filter', params.filters.map(f => `${f.column}:${mapOperator(f.operator)}:${f.value}`).join(','));
        }

        // If subject_id filter, add &subject_id=...
        const subjectFilter = params.filters.find(f => f.column === 'subject_id');
        if (subjectFilter) {
            query.append('subject_id', subjectFilter.value);
        }

        const url = `${host}/api/admin/tasks/?${query}`;
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

    const taskColumns: Column<Task>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'title', label: 'Title', sortable: true, filterable: true },
        { key: 'description', label: 'Description', filterable: true },
        { key: 'requirements', label: 'Requirements', filterable: true },
        {
            key: 'due_date',
            label: 'Due Date',
            sortable: true,
            render: (value) => format(new Date(value), 'PPP p'),
        },
        { key: 'max_score', label: 'Max Score', sortable: true, filterable: true },
        {
            key: 'is_active',
            label: 'Active',
            render: (value) => value ? 'Yes' : 'No',
            sortable: true,
        },
        { key: 'created_by_name', label: 'Created By', sortable: true, filterable: true },
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
        { key: 'subject_id', label: 'Subject ID', sortable: true, filterable: true },
    ];

    const getTaskRowProps = (row: Task): RowProps<Task> => ({
        className: row.is_active ? 'active-row' : 'inactive-row',
        onClick: () => console.log('Clicked task:', row),
    });

    return (
        <div className="route-container">
            <h1>Tasks</h1>
            <TableProvider tableId="tasks-table">
                <Table<Task>
                    tableId="tasks-table"
                    dataFetcher={dataFetcher}
                    columns={taskColumns}
                    getRowProps={getTaskRowProps}
                    pageSize={10}
                    showToolbar
                    showPagination
                    className="tasks-table"
                />
            </TableProvider>
        </div>
    );
}