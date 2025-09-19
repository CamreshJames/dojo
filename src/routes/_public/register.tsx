import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { encryptData, decryptData } from '@lib/utils/cryptoUtils';
import '@lib/styles/login-register/auth.css';
import { ErrorIcon, SuccessIcon } from '@lib/utils/icons';
import dojoLogo from "@src/assets/dojo.png"

// Define the shape of the registration form data including token
interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  token: string;
}

function Register() {
  // Initialize form state
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    token: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const aesKey = import.meta.env.VITE_AES_KEY;
  const adminToken = import.meta.env.VITE_ADMIN_BEARER_TOKEN; // For validation during registration
  const navigate = useNavigate();

  // Validate form including token against admin token
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Warrior name is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Secret kata must be at least 6 characters';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Kata too weak - minimum 6 characters';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm your secret kata';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Katas do not align';
    }
    if (!formData.token.trim()) {
      newErrors.token = 'Master token required to enter the dojo';
    } else if (formData.token !== adminToken) {
      newErrors.token = 'Invalid master token. Only approved keys grant access.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes and clear errors
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setSuccessMessage(null);
  };

  // Handle registration: Validate token, store user with token for future logins
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!aesKey) {
      setErrors({ token: 'Dojo encryption not ready. Alert the sensei.' });
      return;
    }

    setLoading(true);
    try {
      const savedUsers = localStorage.getItem('users');
      let users: Array<{
        username: string;
        password: string;
        token: string;
      }> = [];
      if (savedUsers) {
        const decrypted = await decryptData(savedUsers, aesKey);
        users = JSON.parse(decrypted);
      }

      // Check for duplicate username
      if (users.find(u => u.username === formData.username.trim())) {
        setErrors({ username: 'Warrior name already claimed. Choose another path.' });
        return;
      }

      // Creative: Store the validated token with the user for token-based future logins
      const newTrainee = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        token: formData.token.trim(), // Personal token copy for this trainee
      };
      users.push(newTrainee);

      const encryptedUsers = await encryptData(JSON.stringify(users), aesKey);
      localStorage.setItem('users', encryptedUsers);

      setSuccessMessage('Initiation complete! You are now a dojo trainee. Proceed to login.');
      setTimeout(() => navigate({ to: '/login' }), 2500);
    } catch (error) {
      console.error('Dojo initiation failed:', error);
      setErrors({ token: 'Registration kata disrupted. Retry your form.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-grid">
        <div className="auth-form-section">
          <div className="auth-header">
            <h1 className="auth-title">Join the Dojo</h1>
            <p className="auth-subtitle">Begin your journey as a Tech Trainee. Present your master token for entry.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Warrior Name (Username)</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose your dojo alias"
                className={errors.username ? 'input-error' : ''}
                disabled={loading}
                autoComplete="username"
              />
              {errors.username && (
                <div className="error-message-text">
                  <ErrorIcon />
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Secret Kata (Password)</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Craft a strong technique (min 6 chars)"
                className={errors.password ? 'input-error' : ''}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password && (
                <div className="error-message-text">
                  <ErrorIcon />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Secret Kata</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Repeat your technique"
                className={errors.confirmPassword ? 'input-error' : ''}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div className="error-message-text">
                  <ErrorIcon />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="token">Master Token</label>
              <input
                id="token"
                type="password" // Secure input
                value={formData.token}
                onChange={(e) => handleInputChange('token', e.target.value)}
                placeholder="Enter the dojo access key"
                className={errors.token ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.token && (
                <div className="error-message-text">
                  <ErrorIcon />
                  {errors.token}
                </div>
              )}
            </div>

            {successMessage && (
              <div className="success-message">
                <SuccessIcon />
                {successMessage}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Initiating Trainee...' : 'Join Dojo'}
            </button>

            <div className="auth-footer">
              <p>
                Already initiated? <Link to="/login" className="auth-link">Enter the Dojo</Link>
                <div></div>
                Lost your way? <Link to="/forgot-password" className="auth-link">Seek Guidance</Link>
              </p>
            </div>
          </form>
        </div>
        <div className="auth-decoration-section">
          <img src={dojoLogo} alt="Dojo Tech Training" className="dojo-logo" />
          <h2 className="auth-decoration-title">Become a Tech Warrior</h2>
          <p className="auth-decoration-text">
            In the Dojo, code is your weapon. Train hard, debug harder.
          </p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_public/register')({
  component: Register,
});