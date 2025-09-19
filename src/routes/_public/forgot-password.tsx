import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { decryptData } from '@lib/utils/cryptoUtils';

interface ForgotPasswordFormData {
  username: string;
}

function ForgotPassword() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ username: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const aesKey = import.meta.env.VITE_AES_KEY;
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ForgotPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!aesKey) {
      setErrorMessage('Encryption key is missing. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const savedUsers = localStorage.getItem('users');
      if (!savedUsers) {
        setErrorMessage('No users registered. Please register first.');
        return;
      }

      const decrypted = await decryptData(savedUsers, aesKey);
      const users = JSON.parse(decrypted) as Array<{
        username: string;
        password: string;
        organization: 'Vendor' | 'Client';
        organizationName: string;
      }>;

      const user = users.find(u => u.username === formData.username);
      if (user) {
        // Simulate sending reset link (in a real app, this would trigger an email)
        setSuccessMessage('A password reset link has been sent to your registered email.');
        setTimeout(() => navigate({ to: '/login' }), 2000);
      } else {
        setErrorMessage('Username not found. Please check and try again.');
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      setErrorMessage('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-grid">
        <div className="auth-form-section">
          <div className="auth-header">
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-subtitle">Enter your username to receive a password reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
                className={errors.username ? 'input-error' : ''}
                disabled={loading}
                autoComplete="username"
              />
              {errors.username && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                    <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="12" r="1" fill="red" />
                  </svg>
                  {errors.username}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="error-message full-width">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="red" strokeWidth="1.5" />
                  <path d="M8 4V9" stroke="red" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="12" r="1" fill="red" />
                </svg>
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="green" strokeWidth="1.5" />
                  <path d="M5 8.5L7.5 11L11 6" stroke="green" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {successMessage}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>

            <div className="auth-footer">
              <p>
                Back to <Link to="/login" className="auth-link">Login</Link> or{' '}
                <Link to="/register" className="auth-link">Register</Link>
              </p>
            </div>
          </form>
        </div>
        <div className="auth-decoration-section">
          <h2 className="auth-decoration-title">Reset Your Password</h2>
          <p className="auth-decoration-text">
            Enter your username to receive a secure link to reset your password and regain access to your account.
          </p>
        </div>
      </div>
    </div>
  );
}

// Define the route for /_public/forgot-password
export const Route = createFileRoute('/_public/forgot-password')({
  component: ForgotPassword,
});