import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import Form from '@lib/utils/Form';
import { useEffect, useState } from 'react';
import type { Field } from '@lib/utils/Form';

// Task type
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

export const Route = createFileRoute('/_authenticated/tasks/$taskId')({
    component: TaskDetailComponent,
});

function TaskDetailComponent() {
    // Explicitly define the params type
    const { taskId } = useParams({ from: '/_authenticated/tasks/$taskId' });
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const host = import.meta.env.VITE_HOST_URL;

    const [task, setTask] = useState<Task | null>(null);
    const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isNew = taskId === 'new';

    useEffect(() => {
        if (isNew) {
            setMode('create');
            setTask({
                id: 0,
                subject_id: 0,
                title: '',
                description: '',
                requirements: '',
                due_date: new Date().toISOString(),
                max_score: 100,
                is_active: true,
                created_by: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by_name: '',
            });
            setLoading(false);
            return;
        }

        const fetchTask = async () => {
            const token = getToken();
            if (!token) {
                setError('No auth token');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${host}/admin/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Fetch error');
                const json = await res.json();
                setTask(json);
                setMode('view');
            } catch (err) {
                setError('Failed to load task');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [taskId, isNew, getToken, host]);

    const handleSubmit = async (values: Task) => {
        const token = getToken();
        if (!token) throw new Error('No auth token');

        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${host}/admin/tasks/` : `${host}/admin/tasks/${taskId}`;

        const res = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error('Submit error');

        const newTask = await res.json();
        navigate({ to: `/tasks/${newTask.id || taskId}` });
        setMode('view');
    };

    const taskFields: Field<Task>[] = [
        { name: 'title', label: 'Title', type: 'text', validation: v => v ? null : 'Required' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'requirements', label: 'Requirements', type: 'textarea' },
        { name: 'due_date', label: 'Due Date', type: 'date' },
        { name: 'max_score', label: 'Max Score', type: 'number', validation: v => Number(v) > 0 ? null : 'Positive number required' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
        { name: 'subject_id', label: 'Subject ID', type: 'number', validation: v => Number(v) > 0 ? null : 'Required' },
        { name: 'created_by_name', label: 'Created By', type: 'text', disabled: true },
        { name: 'created_at', label: 'Created At', type: 'text', disabled: true },
        { name: 'updated_at', label: 'Updated At', type: 'text', disabled: true },
    ];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!task) return <div>Task not found</div>;

    return (
        <div>
            <h1>{isNew ? 'Create Task' : `Task: ${task.title}`}</h1>
            <Form<Task>
                fields={taskFields}
                initialValues={task}
                onSubmit={handleSubmit}
                mode={mode}
                submitLabel={isNew ? 'Create' : 'Save'}
            />
            {mode === 'view' && !isNew && (
                <button onClick={() => setMode('edit')}>Edit</button>
            )}
        </div>
    );
}