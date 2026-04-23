import useAuthStore from '../../store/authStore';
import { COLORS } from '../../services/constants';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        <span className="material-symbols-rounded" style={styles.icon}>chat_bubble</span>
        <span style={styles.title}>ChatApp</span>
      </div>

      <div style={styles.actions}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {(user?.display_name || user?.email)?.[0]?.toUpperCase()}
          </div>
          <span style={styles.userName}>{user?.display_name || user?.email}</span>
        </div>

        <button onClick={logout} style={styles.logoutBtn}>
          <span className="material-symbols-rounded">logout</span>
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: COLORS.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
  },
};