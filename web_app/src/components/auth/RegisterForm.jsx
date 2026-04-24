import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function RegisterForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const { register, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    const success = await register(email, password, displayName);
    setIsSubmitting(false);

    if (success) {
      navigate('/');
    }
  };

  const displayError = localError || error;

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { level: 1, label: 'Yếu', color: 'var(--color-error)' };
    if (password.length < 10) return { level: 2, label: 'Trung bình', color: '#F6AD55' };
    return { level: 3, label: 'Mạnh', color: 'var(--color-accent-green)' };
  };
  const strength = getPasswordStrength();

  const fields = [
    { id: 'name', icon: 'person', placeholder: 'Tên hiển thị', value: displayName, setter: setDisplayName, type: 'text' },
    { id: 'email', icon: 'email', placeholder: 'Email', value: email, setter: setEmail, type: 'email' },
  ];

  return (
    <div className="register-page-container">
      <div className="register-blob-1" />
      <div className="register-blob-2" />

      <div className="register-card scale-in">
        <div className="register-logo-area">
          <div className="register-logo-circle">
            <span className="material-symbols-rounded register-logo-icon">
              person_add
            </span>
          </div>
          <h1 className="register-app-name gradient-text">Tạo tài khoản</h1>
          <p className="register-tagline">Tham gia cộng đồng ChatApp ngay hôm nay</p>
        </div>

        {displayError && (
          <div className="register-error-alert fade-in">
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>error</span>
            <span className="register-error-text">{displayError}</span>
            <button
              onClick={() => { setLocalError(''); clearError(); }}
              className="register-error-close"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`register-input-wrapper ${focusedField === field.id ? 'register-input-wrapper--focused' : ''}`}
            >
              <span className="material-symbols-rounded register-input-icon">
                {field.icon}
              </span>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
                className="register-input"
                required
              />
            </div>
          ))}

          <div>
            <div className={`register-input-wrapper ${focusedField === 'password' ? 'register-input-wrapper--focused' : ''}`}>
              <span className="material-symbols-rounded register-input-icon">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="register-input"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="register-toggle-password"
              >
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {strength && (
              <div className="register-strength-row">
                <div className="register-strength-bars">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="register-strength-bar"
                      style={{
                        background: n <= strength.level ? strength.color : 'var(--color-border)',
                      }}
                    />
                  ))}
                </div>
                <span className="register-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className={`register-input-wrapper ${focusedField === 'confirm' ? 'register-input-wrapper--focused' : ''} ${confirmPassword && confirmPassword !== password ? 'register-input-wrapper--error' : ''}`}>
            <span className="material-symbols-rounded register-input-icon">
              lock_reset
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              className="register-input"
              required
            />
            {confirmPassword && (
              <span className="material-symbols-rounded register-password-match-icon" style={{
                color: confirmPassword === password ? 'var(--color-accent-green)' : 'var(--color-error)',
              }}>
                {confirmPassword === password ? 'check_circle' : 'cancel'}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`register-submit-btn ${isSubmitting ? 'register-submit-btn--loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="register-loading-row">
                <span className="register-spinner" />
                Đang tạo tài khoản...
              </span>
            ) : (
              <>
                <span>Tạo tài khoản</span>
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="register-footer">
          Đã có tài khoản?{' '}
          <a href="/login" className="register-login-link">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
}