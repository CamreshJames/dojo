import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { decryptData, encryptData } from '@lib/utils/cryptoUtils';
import { useAuth } from '@lib/contexts/AuthContext';
import '@lib/styles/login-register/auth.css';
import { ErrorIcon } from '@lib/utils/icons';
import dojoLogo from "@src/assets/dojo.png"

// Define the shape of the login form data supporting both username/password and token
interface LoginFormData {
  username: string;
  password: string;
  token: string;
}

function Login() {
  // Initialize form state with all fields
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    token: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login } = useAuth();
  const aesKey = import.meta.env.VITE_AES_KEY;
  const navigate = useNavigate();

  // Validate form based on input method: token-only, username/password, or both
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    const hasToken = formData.token.trim();
    const hasUsername = formData.username.trim();
    const hasPassword = formData.password.trim();

    if (!hasToken && (!hasUsername || !hasPassword)) {
      newErrors.username = 'Either provide a valid token OR username and password';
      newErrors.password = newErrors.username;
      newErrors.token = newErrors.username;
    } else if (hasToken && !hasUsername && !hasPassword) {
      // Token-only login: no additional validation here (server-side in handleSubmit)
    } else if (hasUsername && hasPassword && !hasToken) {
      // Username/password login: basic validation
      if (!hasUsername) newErrors.username = 'Username is required';
      if (!hasPassword) newErrors.password = 'Password is required';
    } else {
      // Both provided: allow flexibility, but warn if inconsistent
      if (hasToken && (!hasUsername || !hasPassword)) {
        // Token with partial creds: ok, but clear errors
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes, clear errors, and reset unrelated fields if switching modes
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Creative UX: If token is entered, optionally clear username/password for token-only mode
    if (field === 'token' && value.trim()) {
      setFormData(prev => ({ ...prev, username: '', password: '' }));
      setErrors(prev => ({ ...prev, username: undefined, password: undefined }));
    }
    setLoginError(null);
  };

  // Handle form submission with flexible authentication paths
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!aesKey) {
      setLoginError('Encryption setup incomplete. Contact dojo master.');
      return;
    }

    setLoading(true);
    try {
      const savedUsers = localStorage.getItem('users');
      if (!savedUsers) {
        setLoginError('No trainees in the dojo. Complete registration first.');
        return;
      }

      const decrypted = await decryptData(savedUsers, aesKey);
      const users = JSON.parse(decrypted) as Array<{
        username: string;
        password: string;
        token: string;
      }>;

      let matchedUser = null;

      // Priority 1: Try token authentication (even if username/password provided)
      if (formData.token.trim()) {
        matchedUser = users.find(u => u.token === formData.token.trim());
      }

      // Priority 2: If no token match, try username/password
      if (!matchedUser && formData.username.trim() && formData.password.trim()) {
        matchedUser = users.find(
          u => u.username === formData.username.trim() && u.password === formData.password.trim()
        );
      }

      if (matchedUser) {
        // Creative: Store both username and token in session for future API use
        const userData = {
          username: matchedUser.username,
          token: matchedUser.token,
        };
        const encryptedCurrentUser = await encryptData(JSON.stringify(userData), aesKey);
        localStorage.setItem('currentUser', encryptedCurrentUser);
        login(userData);
        navigate({ to: '/dashboard', replace: true });
      } else {
        setLoginError(
          formData.token.trim()
            ? 'Invalid dojo access token. Seek the master key.'
            : 'Invalid credentials. Check your warrior name and secret kata.'
        );
      }
    } catch (error) {
      console.error('Dojo entry failed:', error);
      setLoginError('Training session disrupted. Retry your approach.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-grid">
        <div className="auth-form-section">
          <div className="auth-header">
            <h1 className="auth-title">Enter the Dojo</h1>
            <p className="auth-subtitle">Access the Tech Training Grounds. Use your warrior credentials or master token.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Warrior Name (Username)</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Your dojo alias"
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
                placeholder="Your hidden technique"
                className={errors.password ? 'input-error' : ''}
                disabled={loading}
                autoComplete="current-password"
              />
              {errors.password && (
                <div className="error-message-text">
                  <ErrorIcon />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="token">Master Token (Optional)</label>
              <input
                id="token"
                type="password" // Hide for security
                value={formData.token}
                onChange={(e) => handleInputChange('token', e.target.value)}
                placeholder="Dojo access key"
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

            {loginError && (
              <div className="error-message-text full-width">
                <ErrorIcon />
                {loginError}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Initiating Training...' : 'Enter Dojo'}
            </button>

            <div className="auth-footer">
              <p>
                Forgotten your kata? <Link to="/forgot-password" className="auth-link">Seek guidance</Link>
                <br />
                New to the dojo? <Link to="/register" className="auth-link">Join as Trainee</Link>
              </p>
            </div>
          </form>
        </div>
        <div className="auth-decoration-section">
          <img src={dojoLogo} alt="Dojo Tech Training" className="dojo-logo" />
          <h2 className="auth-decoration-title">Tech Dojo Awaits</h2>
          <p className="auth-decoration-text">
            Forge your skills in the fires of code. One kata at a time.
          </p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_public/login')({
  component: Login,
});