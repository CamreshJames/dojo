import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Form, { type Field } from '@lib/utils/Form';
import { useFetch, useMutate } from '@lib/utils/useApiHooks';
import { useState } from 'react';
import { type Task, type Subject } from '@lib/types/types';
import { useAuth } from '@lib/contexts/AuthContext';

function TaskCreate() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const token = getToken();
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: subjectsData, loading: subjectsLoading, error: subjectsError } = useFetch<{ records: Subject[] }>(
    '/admin/subjects?page=1&pageSize=100',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: token || undefined,
      skip: !token,
    }
  );

  const { mutate, loading: mutateLoading, error: mutateError } = useMutate<Task>(
    '/admin/tasks',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: token || undefined,
      defaultMethod: 'POST',
      skip: !token,
    }
  );

  const subjects = subjectsData?.records || [];

  const fields: Field<Task>[] = [
    {
      name: 'subject_id',
      label: 'Subject',
      type: 'select',
      options: subjects.map((s) => ({ value: s.id.toString(), label: s.name })),
      validation: (value: string) => (!value ? 'Subject is required' : null),
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      validation: (value: string) => (!value ? 'Title is required' : null),
      placeholder: 'Enter task title',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter task description',
    },
    {
      name: 'requirements',
      label: 'Requirements',
      type: 'textarea',
      placeholder: 'Enter task requirements',
    },
    {
      name: 'due_date',
      label: 'Due Date',
      type: 'date',
      validation: (value: string) => {
        if (!value) return 'Due date is required';
        if (new Date(value) < new Date()) return 'Due date must be in the future';
        return null;
      },
    },
    {
      name: 'max_score',
      label: 'Max Score',
      type: 'number',
      validation: (value: string) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) return 'Score must be a number';
        if (num <= 0) return 'Score must be positive';
        return null;
      },
      placeholder: 'Enter max score',
    },
  ];

  const handleSubmit = async (values: Task) => {
    if (!token) {
      setCreateError('No authentication token available');
      return;
    }
    const payload: Task = {
      ...values,
      subject_id: parseInt(values.subject_id as unknown as string, 10),
      max_score: parseInt(values.max_score as unknown as string, 10),
      due_date: `${values.due_date}T00:00:00.000Z`,
    };
    const success = await mutate(payload, 'POST');
    if (success) {
      navigate({ to: '/tasks' });
    } else {
      setCreateError(mutateError || 'Failed to create task');
    }
  };

  if (!token) return <div>Error: No auth token</div>;
  if (subjectsLoading) return <div>Loading subjects...</div>;
  if (subjectsError) return <div>Error loading subjects: {subjectsError}</div>;

  return (
    <div className="task-create" style={{
      '--primary': 'hsl(12, 100%, 50%)',
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '0 1rem',
    } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
        Create New Task
      </h1>
      {createError && (
        <div className="create-error" style={{
          padding: '1rem',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          margin: '1rem 0',
          textAlign: 'center',
        }}>
          Error: {createError}
        </div>
      )}
      {mutateLoading && (
        <div className="create-loading" style={{
          padding: '1rem',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          margin: '1rem 0',
          textAlign: 'center',
        }}>
          Creating task...
        </div>
      )}
      <Form<Task>
        fields={fields}
        initialValues={{
          subject_id: 0,
          title: '',
          description: '',
          requirements: '',
          due_date: '',
          max_score: 100,
          is_active: true,
        }}
        onSubmit={handleSubmit}
        mode="create"
        submitLabel="Create Task"
        className="task-create-form"
      />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/tasks/create')({
  component: TaskCreate,
});