import { createFileRoute, useNavigate,useParams } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import Form from '@lib/utils/Form';
import { useEffect, useState } from 'react';
import type { Field } from '@lib/utils/Form';

// Subject type
interface Subject {
    id: number;
    name: string;
    description: string;
    created_by: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by_name: string;
}

export const Route = createFileRoute('/_authenticated/subjects/$subjectId')({
    component: SubjectDetailComponent,
});

function SubjectDetailComponent() {
    // Explicitly define the params type
    const { subjectId } = useParams({ from: '/_authenticated/subjects/$subjectId' });
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const host = import.meta.env.VITE_HOST_URL;

    const [subject, setSubject] = useState<Subject | null>(null);
    const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isNew = subjectId === 'new';

    useEffect(() => {
        if (isNew) {
            setMode('create');
            setSubject({
                id: 0,
                name: '',
                description: '',
                created_by: 0,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by_name: '',
            });
            setLoading(false);
            return;
        }

        const fetchSubject = async () => {
            const token = getToken();
            if (!token) {
                setError('No auth token');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${host}/admin/subjects/${subjectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Fetch error');
                const json = await res.json();
                setSubject(json);
                setMode('view');
            } catch (err) {
                setError('Failed to load subject');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubject();
    }, [subjectId, isNew, getToken, host]);

    const handleSubmit = async (values: Subject) => {
        const token = getToken();
        if (!token) throw new Error('No auth token');

        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${host}/admin/subjects/` : `${host}/admin/subjects/${subjectId}`;

        const res = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error('Submit error');

        const newSubject = await res.json();
        navigate({ to: `/subjects/${newSubject.id || subjectId}` });
        setMode('view');
    };

    const subjectFields: Field<Subject>[] = [
        { name: 'name', label: 'Name', type: 'text', validation: v => v ? null : 'Required' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
        { name: 'created_by_name', label: 'Created By', type: 'text', disabled: true },
        { name: 'created_at', label: 'Created At', type: 'text', disabled: true },
        { name: 'updated_at', label: 'Updated At', type: 'text', disabled: true },
    ];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!subject) return <div>Subject not found</div>;

    return (
        <div>
            <h1>{isNew ? 'Create Subject' : `Subject: ${subject.name}`}</h1>
            <Form<Subject>
                fields={subjectFields}
                initialValues={subject}
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