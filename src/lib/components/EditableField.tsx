import { EditIcon } from '@lib/utils/icons';
import React, { useState, useEffect, useRef } from 'react';

interface EditableFieldProps {
    value: string | number | boolean;
    onSave: (value: any) => Promise<boolean>;
    type?: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date';
    options?: { value: string; label: string }[];
    placeholder?: string;
    disabled?: boolean;
    multiline?: boolean;
    validation?: (value: any) => string | null;
}

const EditableField: React.FC<EditableFieldProps> = ({
    value,
    onSave,
    type = 'text',
    options = [],
    placeholder,
    disabled = false,
    validation,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
                inputRef.current.select();
            }
        }
    }, [isEditing]);

    const handleEdit = () => {
        if (disabled) return;
        setIsEditing(true);
        setError(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(value);
        setError(null);
    };

    const handleSave = async () => {
        if (validation) {
            const validationError = validation(editValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const success = await onSave(editValue);
            if (success) {
                setIsEditing(false);
            } else {
                setError('Failed to save changes');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const renderDisplayValue = () => {
        if (type === 'select' && options.length > 0) {
            const option = options.find(opt => opt.value === String(value));
            return option ? option.label : String(value);
        }

        if (type === 'date' && value) {
            return new Date(String(value)).toLocaleDateString();
        }

        return String(value || '');
    };

    const inputStyles: React.CSSProperties = {
        width: '100%',
        padding: '0.25rem 0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: 'inherit',
        fontFamily: 'inherit',
    };

    const buttonStyles: React.CSSProperties = {
        padding: '0.25rem 0.5rem',
        margin: '0 0.25rem',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '0.8rem',
    };

    if (isEditing) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '120px' }}>
                    {type === 'select' ? (
                        <select
                            ref={inputRef as React.RefObject<HTMLSelectElement>}
                            value={String(editValue)}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={inputStyles}
                            disabled={loading}
                        >
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : type === 'textarea' ? (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            value={String(editValue)}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            style={{ ...inputStyles, minHeight: '60px', resize: 'vertical' }}
                            disabled={loading}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type={type}
                            value={String(editValue)}
                            onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            style={inputStyles}
                            disabled={loading}
                        />
                    )}
                    {error && (
                        <div style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {error}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            ...buttonStyles,
                            background: '#28a745',
                            color: 'white',
                        }}
                    >
                        {loading ? '...' : '✓'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        style={{
                            ...buttonStyles,
                            background: '#6c757d',
                            color: 'white',
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: disabled ? 'default' : 'pointer',
                padding: '0.25rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
            }}
            onClick={handleEdit}
            onMouseOver={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <span style={{ flex: '1' }}>{renderDisplayValue()}</span>
            {!disabled && (
                <span
                    style={{
                        opacity: 0.5,
                        fontSize: '0.8rem',
                        color: '#6c757d',
                    }}
                >
                    <EditIcon fill="#000" className="svg" height="20" width="20"/>
                </span>
            )}
        </div>
    );
};

export default EditableField;