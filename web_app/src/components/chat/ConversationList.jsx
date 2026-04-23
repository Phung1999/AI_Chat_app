import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../services/constants';

export default function ConversationList({ onSelect }) {
  const { conversations, loadConversations, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    }
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p.id !== user?.id) || conv.participants?.[0];
  };

  if (isLoading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div style={styles.empty}>
        <span className="material-symbols-rounded" style={styles.emptyIcon}>chat</span>
        <p>No conversations yet</p>
        <p style={styles.emptyHint}>Search for users to start chatting</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {conversations.map((conv) => {
        const otherUser = getOtherParticipant(conv);
        const displayName = conv.name || otherUser?.display_name || otherUser?.email || 'Unknown';
        const avatarText = displayName[0].toUpperCase();
        const isOnline = otherUser?.online_status === 1;

        return (
          <div
            key={conv.id}
            style={styles.item}
            onClick={() => onSelect?.(conv)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={styles.avatarWrapper}>
              <div style={styles.avatar}>{avatarText}</div>
              {isOnline && <div style={styles.onlineDot} />}
            </div>

            <div style={styles.content}>
              <div style={styles.header}>
                <span style={styles.name}>{displayName}</span>
                <span style={styles.time}>
                  {formatTime(conv.lastMessage?.created_at || conv.created_at)}
                </span>
              </div>
              <div style={styles.preview}>
                <span style={styles.lastMessage}>{conv.lastMessage?.content || 'No messages yet'}</span>
                {conv.unreadCount > 0 && (
                  <span style={styles.badge}>{conv.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 8,
  },
  list: {
    height: '100%',
    overflow: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: COLORS.online,
    border: '2px solid white',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 500,
  },
  time: {
    fontSize: 12,
    color: COLORS.time,
  },
  preview: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.accent,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: 12,
    marginLeft: 8,
  },
};