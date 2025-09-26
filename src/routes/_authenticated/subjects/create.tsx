import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Form, { type Field } from '@lib/utils/Form';
import { useMutate } from '@lib/utils/useApiHooks';
import { useState } from 'react';
import { type Subject } from '@lib/types/types';
import { useAuth } from '@lib/contexts/AuthContext';

function SubjectCreate() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const token = getToken();
  const [createError, setCreateError] = useState<string | null>(null);

  const { mutate, loading: mutateLoading, error: mutateError } = useMutate<Subject>(
    '/admin/subjects',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: token || undefined,
      defaultMethod: 'POST',
      skip: !token,
    }
  );

  const fields: Field<Subject>[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      validation: (value: string) => (!value ? 'Name is required' : null),
      placeholder: 'Enter subject name',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter subject description',
    },
  ];

  const handleSubmit = async (values: Subject) => {
    if (!token) {
      setCreateError('No authentication token available');
      return;
    }
    const success = await mutate(values, 'POST');
    if (success) {
      navigate({ to: '/subjects' });
    } else {
      setCreateError(mutateError || 'Failed to create subject');
    }
  };

  if (!token) return <div>Error: No auth token</div>;

  return (
    <div className="subject-create" style={{
      '--primary': 'hsl(12, 100%, 50%)',
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '0 1rem',
    } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
        Create New Subject
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
          Creating subject...
        </div>
      )}
      <Form<Subject>
        fields={fields}
        initialValues={{ name: '', description: '' }}
        onSubmit={handleSubmit}
        mode="create"
        submitLabel="Create Subject"
        className="subject-create-form"
      />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/subjects/create')({
  component: SubjectCreate,
});