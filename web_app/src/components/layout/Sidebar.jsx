import useAuthStore from '../../store/authStore';
import { useState } from 'react';

export default function Sidebar({ activeTab, onTabChange, notificationCount = 0 }) {
  const { user, logout } = useAuthStore();
  const [hoveredTab, setHoveredTab] = useState(null);

  const tabs = [
    { id: 'chat', icon: 'chat_bubble', label: 'Chat' },
    { id: 'contacts', icon: 'people', label: 'Liên hệ' },
    { id: 'calls', icon: 'call', label: 'Cuộc gọi' },
    { id: 'notifications', icon: 'notifications', label: 'Thông báo' },
    { id: 'settings', icon: 'settings', label: 'Cài đặt' },
  ];

  const avatarLetter = (user?.display_name || user?.email || 'U')[0].toUpperCase();
  const initials = user?.display_name
    ? user.display_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : avatarLetter;

  return (
    <div className="sidebar-container">
      <div className="sidebar-gradient-overlay" />

      <div className="sidebar-user-section">
        <div className="sidebar-avatar-outer">
          <div className="sidebar-avatar">
            <span className="sidebar-avatar-text">{initials}</span>
          </div>
          <div className="sidebar-online-ring" />
          <div className="sidebar-online-dot" />
        </div>
      </div>

      <nav className="sidebar-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;
          return (
            <div key={tab.id} className="sidebar-tab-item">
              <button
                className={`sidebar-tab ${isActive ? 'sidebar-tab--active' : ''}`}
                onClick={() => onTabChange?.(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                title={tab.label}
              >
                <span
                  className="material-symbols-rounded sidebar-tab-icon"
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {tab.icon}
                </span>
                {isActive && <div className="sidebar-active-indicator" />}
                {tab.id === 'notifications' && notificationCount > 0 && (
                  <span className="sidebar-badge">{notificationCount}</span>
                )}
              </button>
              {isHovered && (
                <div className="sidebar-tooltip">
                  {tab.label}
                  <div className="sidebar-tooltip-arrow" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-bottom-section">
        <div className="sidebar-divider-line" />
        <div style={{ position: 'relative' }}>
          <button
            className={`sidebar-tab ${hoveredTab === 'logout' ? 'sidebar-tab-logout' : ''}`}
            onClick={logout}
            onMouseEnter={() => setHoveredTab('logout')}
            onMouseLeave={() => setHoveredTab(null)}
            title="�ăng xuất"
          >
            <span className="material-symbols-rounded sidebar-tab-icon">logout</span>
          </button>
          {hoveredTab === 'logout' && (
            <div className="sidebar-tooltip sidebar-tooltip--danger">
              Đăng xuất
              <div className="sidebar-tooltip-arrow sidebar-tooltip-arrow--danger" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}