<DOCUMENT filename="tasks/index.tsx">
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, type Column } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { useFetch } from '@lib/utils/useApiHooks';
import { useCallback } from 'react';

interface TaskRow {
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

function TasksIndex() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const token = getToken();

  const { data, loading, error, refetch } = useFetch<{ records: TaskRow[] }>(
    `/admin/tasks?page=1&pageSize=100`,
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token,
      skip: !token,
    }
  );

  if (!token) return <div>Error: No auth token</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const records = data?.records || [];

  const columns: Column<TaskRow>[] = [
    { key: 'id', label: 'ID', sortable: true, filterable: true },
    { key: 'title', label: 'Title', sortable: true, filterable: true },
    { key: 'description', label: 'Description', filterable: true },
    { key: 'due_date', label: 'Due Date', sortable: true },
    { key: 'max_score', label: 'Max Score', sortable: true },
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

  const getRowProps = (row: TaskRow) => ({
    onClick: () => navigate({ to: `/tasks/${row.id}` }),
    className: !row.is_active ? 'row-inactive' : '',
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="tasks-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Tasks</h1>
        <Table<TaskRow>
          tableId="tasks-table"
          data={records}
          columns={columns}
          onRefresh={handleRefresh}
          getRowProps={getRowProps}
          initialPageSize={10}
        />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/tasks/')({
  component: TasksIndex,
});
</DOCUMENT>

<DOCUMENT filename="subjects/index.tsx">
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table, type Column } from '@lib/utils/table/Table';
import { useAuth } from '@lib/contexts/AuthContext';
import { useFetch } from '@lib/utils/useApiHooks';
import { useCallback } from 'react';

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
  const token = getToken();

  const { data, loading, error, refetch } = useFetch<{ records: SubjectRow[] }>(
    `/admin/subjects?page=1&pageSize=5`,
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token,
      skip: !token,
    }
  );

  if (!token) return <div>Error: No auth token</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const records = data?.records || [];

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
    refetch();
  };

  return (
    <div className="subjects-index" style={{ '--primary': 'hsl(12, 100%, 50%)' } as React.CSSProperties}>
      <h1 style={{ color: 'var(--primary)' }}>Subjects</h1>
        <Table<SubjectRow>
          tableId="subjects-table"
          data={records}
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
</DOCUMENT>

<DOCUMENT filename="subjects/create.tsx">
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Form, { type Field } from '@lib/components/Form'; // Assuming Form is exported from Form.tsx
import { useMutate } from '@lib/utils/useApiHooks';
import { useState } from 'react';
import { type Subject } from '@lib/types/types'; // Assuming Subject type is available

function SubjectCreate() {
  const navigate = useNavigate();
  const [createError, setCreateError] = useState<string | null>(null);

  const { mutate, loading: mutateLoading, error: mutateError } = useMutate<Subject>(
    '/admin/subjects',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: import.meta.env.VITE_ADMIN_BEARER_TOKEN, // Using env token as in detail pages; adjust if needed
      defaultMethod: 'POST',
    }
  );

  const fields: Field<Subject>[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      validation: (value) => (!value ? 'Name is required' : null),
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
    const success = await mutate(values, 'POST');
    if (success) {
      navigate({ to: '/subjects' });
    } else {
      setCreateError(mutateError || 'Failed to create subject');
    }
  };

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
</DOCUMENT>

<DOCUMENT filename="tasks/create.tsx">
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Form, { type Field } from '@lib/components/Form'; // Assuming Form is exported from Form.tsx
import { useFetch, useMutate } from '@lib/utils/useApiHooks';
import { useState } from 'react';
import { type Task, type Subject } from '@lib/types/types'; // Assuming types are available

function TaskCreate() {
  const navigate = useNavigate();
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: subjectsData, loading: subjectsLoading, error: subjectsError } = useFetch<{ records: Subject[] }>(
    '/admin/subjects?page=1&pageSize=100',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: import.meta.env.VITE_ADMIN_BEARER_TOKEN, // Using env token as in detail pages; adjust if needed
    }
  );

  const { mutate, loading: mutateLoading, error: mutateError } = useMutate<Task>(
    '/admin/tasks',
    {
      baseUrl: import.meta.env.VITE_HOST_URL,
      token: import.meta.env.VITE_ADMIN_BEARER_TOKEN,
      defaultMethod: 'POST',
    }
  );

  const subjects = subjectsData?.records || [];

  const fields: Field<Task>[] = [
    {
      name: 'subject_id',
      label: 'Subject',
      type: 'select',
      options: subjects.map((s) => ({ value: s.id.toString(), label: s.name })),
      validation: (value) => (!value ? 'Subject is required' : null),
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      validation: (value) => (!value ? 'Title is required' : null),
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
      validation: (value) => {
        if (!value) return 'Due date is required';
        if (new Date(value) < new Date()) return 'Due date must be in the future';
        return null;
      },
    },
    {
      name: 'max_score',
      label: 'Max Score',
      type: 'number',
      validation: (value) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) return 'Score must be a number';
        if (num <= 0) return 'Score must be positive';
        return null;
      },
      placeholder: 'Enter max score',
    },
  ];

  const handleSubmit = async (values: Task) => {
    const payload = {
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
          subject_id: '',
          title: '',
          description: '',
          requirements: '',
          due_date: '',
          max_score: '',
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
</DOCUMENT>