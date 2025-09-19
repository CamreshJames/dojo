import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useAuth } from '@lib/contexts/AuthContext';
import Form from '@lib/utils/Form';
import { useEffect, useState } from 'react';
import type { Field } from '@lib/utils/Form';

// User type
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

export const Route = createFileRoute('/_authenticated/users/$userId')({
    component: UserDetailComponent,
});

function UserDetailComponent() {
    // Explicitly define the params type
    const { userId } = useParams({ from: '/_authenticated/users/$userId' });
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const host = import.meta.env.VITE_HOST_URL;

    const [user, setUser] = useState<User | null>(null);
    const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isNew = userId === 'new';

    useEffect(() => {
        if (isNew) {
            setMode('create');
            setUser({
                id: 0,
                email: '',
                name: '',
                google_id: '',
                role: 'trainee',
                status: 'pending',
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            const token = getToken();
            if (!token) {
                setError('No auth token');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${host}/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Fetch error');
                const json = await res.json();
                setUser(json);
                setMode('view');
            } catch (err) {
                setError('Failed to load user');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, isNew, getToken, host]);

    const handleSubmit = async (values: User) => {
        const token = getToken();
        if (!token) throw new Error('No auth token');

        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${host}/admin/users/` : `${host}/admin/users/${userId}`;

        const res = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error('Submit error');

        const newUser = await res.json();
        navigate({ to: `/users/${newUser.id || userId}` });
        setMode('view');
    };

    const userFields: Field<User>[] = [
        { name: 'name', label: 'Name', type: 'text', validation: v => v ? null : 'Required' },
        { name: 'email', label: 'Email', type: 'email', validation: v => v.includes('@') ? null : 'Invalid email' },
        { name: 'google_id', label: 'Google ID', type: 'text' },
        {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [
                { value: 'trainee', label: 'Trainee' },
                { value: 'admin', label: 'Admin' },
            ],
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
            ],
        },
        { name: 'avatar_url', label: 'Avatar URL', type: 'text' },
        { name: 'created_at', label: 'Created At', type: 'text', disabled: true },
        { name: 'updated_at', label: 'Updated At', type: 'text', disabled: true },
    ];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div>
            <h1>{isNew ? 'Create User' : `User: ${user.name}`}</h1>
            <Form<User>
                fields={userFields}
                initialValues={user}
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