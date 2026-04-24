import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

export default function SettingsPage({ onBack }) {
  const { user, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await authAPI.updateProfile({ displayName: displayName.trim() });
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="settings-back" onClick={onBack}>
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h2>Cài đặt</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Tài khoản</h3>
          
          <div className="settings-item">
            <label>Email</label>
            <div className="settings-value">{user?.email}</div>
          </div>

          <div className="settings-item">
            <label>Tên hiển thị</label>
            <input 
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="settings-input"
            />
          </div>

          <button 
            className="settings-save"
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        <div className="settings-section">
          <h3>Ứng dụng</h3>
          
          <div className="settings-item">
            <label>Phiên bản</label>
            <div className="settings-value">1.0.0</div>
          </div>
        </div>

        <div className="settings-section">
          <button className="settings-logout" onClick={handleLogout}>
            <span className="material-symbols-rounded">logout</span>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}