import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) navigate('/');
  };

  return (
    <div className="login-mini-container">
      <form className="login-mini-form" onSubmit={handleSubmit}>
        <div className="login-mini-logo">
          <span className="material-symbols-rounded">chat</span>
        </div>
        
        <h1 className="login-mini-title">ChatApp</h1>
        
        {error && (
          <div className="login-mini-error">{error}</div>
        )}

        <div className="login-mini-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-mini-input"
            required
          />
        </div>

        <div className="login-mini-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-mini-input"
            required
          />
        </div>

        <button type="submit" className="login-mini-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Loading...' : 'Login'}
        </button>

        <p className="login-mini-footer">
          No account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}