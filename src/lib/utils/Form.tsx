// @lib/utils/Form.tsx
import React, { useState, useEffect } from 'react';
import './Form.css'

// Generic Form field type
export interface Field<Values> {
    name: keyof Values;
    label: string;
    type: 'text' | 'password' | 'email' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea';
    options?: { value: string; label: string }[]; // For select
    validation?: (value: any) => string | null; // Validation function returning error or null
    disabled?: boolean;
    placeholder?: string;
}

// Generic Form props
interface FormProps<Values extends object> {
    fields: Field<Values>[];
    initialValues: Partial<Values>;
    onSubmit: (values: Values) => Promise<void> | void;
    mode: 'view' | 'edit' | 'create';
    submitLabel?: string;
    className?: string;
}

function Form<Values extends object>({
    fields,
    initialValues,
    onSubmit,
    mode,
    submitLabel = 'Submit',
    className = '',
}: FormProps<Values>) {
    const [values, setValues] = useState<Partial<Values>>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const handleChange = (name: keyof Values, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const validateField = (name: keyof Values, value: any) => {
        const field = fields.find(f => f.name === name);
        if (field?.validation) {
            const error = field.validation(value);
            setErrors(prev => ({ ...prev, [name]: error || undefined }));
            return error;
        }
        return null;
    };

    const validateAll = () => {
        let valid = true;
        const newErrors: Partial<Record<keyof Values, string>> = {};
        fields.forEach(field => {
            const error = validateField(field.name, values[field.name]);
            if (error) {
                newErrors[field.name] = error;
                valid = false;
            }
        });
        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        Object.keys(values).forEach(key => setTouched(prev => ({ ...prev, [key as keyof Values]: true })));
        if (!validateAll()) return;

        setSubmitting(true);
        try {
            await onSubmit(values as Values);
        } catch (err) {
            console.error('Form submission error:', err);
            // Handle global error if needed
        } finally {
            setSubmitting(false);
        }
    };

    const isViewMode = mode === 'view';
    const isDisabled = (field: Field<Values>) => isViewMode || field.disabled || submitting;

    return (
        <form onSubmit={handleSubmit} className={className}>
            {fields.map(field => (
                <div key={String(field.name)} className="form-group">
                    <label htmlFor={String(field.name)}>{field.label}</label>
                    {field.type === 'select' && field.options ? (
                        <select
                            id={String(field.name)}
                            value={String(values[field.name] ?? '')}
                            onChange={e => handleChange(field.name, e.target.value)}
                            disabled={isDisabled(field)}
                        >
                            {field.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ) : field.type === 'checkbox' ? (
                        <input
                            id={String(field.name)}
                            type="checkbox"
                            checked={Boolean(values[field.name])}
                            onChange={e => handleChange(field.name, e.target.checked)}
                            disabled={isDisabled(field)}
                        />
                    ) : field.type === 'textarea' ? (
                        <textarea
                            id={String(field.name)}
                            value={String(values[field.name] ?? '')}
                            onChange={e => handleChange(field.name, e.target.value)}
                            disabled={isDisabled(field)}
                            placeholder={field.placeholder}
                        />
                    ) : (
                        <input
                            id={String(field.name)}
                            type={field.type}
                            value={String(values[field.name] ?? '')}
                            onChange={e => handleChange(field.name, e.target.value)}
                            disabled={isDisabled(field)}
                            placeholder={field.placeholder}
                        />
                    )}
                    {touched[field.name] && errors[field.name] && (
                        <div className="error-message">{errors[field.name]}</div>
                    )}
                </div>
            ))}
            {!isViewMode && (
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : submitLabel}
                </button>
            )}
        </form>
    );
}

export default Form;