import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../services/constants';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>
          <span className="material-symbols-rounded" style={{ fontSize: 64, color: COLORS.primary }}>
            chat_bubble_outline
          </span>
        </div>
        <h1 style={styles.title}>ChatApp</h1>
        <p style={styles.subtitle}>Sign in to continue</p>

        {error && (
          <div style={styles.error}>
            {error}
            <button onClick={clearError} style={styles.errorClose}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <span className="material-symbols-rounded" style={styles.inputIcon}>email</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <span className="material-symbols-rounded" style={styles.inputIcon}>lock</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.togglePassword}
            >
              <span className="material-symbols-rounded">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <button type="submit" style={styles.button}>Sign In</button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <a href="/register" style={styles.link}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#666',
    marginBottom: 32,
  },
  error: {
    backgroundColor: '#ffebee',
    color: COLORS.error,
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    color: COLORS.error,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    color: '#999',
    fontSize: 20,
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    border: 'none',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    outline: 'none',
  },
  togglePassword: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    color: '#666',
  },
  link: {
    color: COLORS.primary,
    textDecoration: 'none',
    fontWeight: 600,
  },
};