import useAuthStore from '../../store/authStore';
import { COLORS } from '../../services/constants';

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuthStore();

  const tabs = [
    { id: 'chat', icon: 'chat', label: 'Chat' },
    { id: 'contacts', icon: 'contacts', label: 'Contacts' },
    { id: 'cloud', icon: 'cloud', label: 'Cloud' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.avatar}>
        {(user?.display_name || user?.email || 'U')[0].toUpperCase()}
      </div>

      <div style={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => onTabChange?.(tab.id)}
            title={tab.label}
          >
            <span className="material-symbols-rounded">{tab.icon}</span>
          </button>
        ))}
      </div>

      <button onClick={logout} style={styles.logoutBtn} title="Logout">
        <span className="material-symbols-rounded">logout</span>
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: 64,
    height: '100vh',
    backgroundColor: COLORS.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: COLORS.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 24,
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  tab: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};