import { useState, useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../services/constants';

export default function ChatList({ onSelectConversation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuthStore();
  const { conversations, loadConversations, searchUsers } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results.filter((u) => u.id !== user?.id));
    setIsSearching(false);
  };

  const handleSelectUser = async (u) => {
    const { getOrCreateConversation } = useChatStore.getState();
    const conversation = await getOrCreateConversation(u.id);
    if (conversation) {
      onSelectConversation?.(conversation);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = activeTab === 'unread'
    ? conversations.filter((c) => c.unreadCount > 0)
    : conversations;

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p.id !== user?.id) || conv.participants?.[0];
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
      </div>

      <div style={styles.searchContainer}>
        <span className="material-symbols-rounded" style={styles.searchIcon}>search</span>
        <input
          type="text"
          placeholder="Search or start new chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'all' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'unread' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('unread')}
        >
          Unread
        </button>
      </div>

      <div style={styles.list}>
        {searchResults.length > 0 ? (
          searchResults.map((u) => (
            <div
              key={u.id}
              style={styles.userItem}
              onClick={() => handleSelectUser(u)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={styles.avatar}>
                {(u.display_name || u.email || 'U')[0].toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{u.display_name || u.email}</div>
                <div style={styles.userEmail}>{u.email}</div>
              </div>
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          <div style={styles.empty}>
            <span className="material-symbols-rounded" style={styles.emptyIcon}>chat</span>
            <p>No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            const displayName = otherUser?.display_name || otherUser?.email || 'Unknown';
            const isOnline = otherUser?.online_status === 1;
            const isUnread = conv.unreadCount > 0;
            const lastMsg = conv.lastMessage?.content || 'No messages yet';

            return (
              <div
                key={conv.id}
                style={styles.item}
                onClick={() => onSelectConversation?.(conv)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatar}>
                    {displayName[0].toUpperCase()}
                  </div>
                  {isOnline && <div style={styles.onlineDot} />}
                </div>
                <div style={styles.content}>
                  <div style={styles.row}>
                    <span style={{ ...styles.name, ...(isUnread ? styles.nameBold : {}) }}>
                      {displayName}
                    </span>
                    <span style={styles.time}>
                      {formatTime(conv.lastMessage?.created_at)}
                    </span>
                  </div>
                  <div style={styles.row}>
                    <span style={{ ...styles.lastMessage, ...(isUnread ? styles.lastMessageBold : {}) }}>
                      {lastMsg}
                    </span>
                    {isUnread && <span style={styles.badge}>{conv.unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: 280,
    height: '100vh',
    backgroundColor: 'white',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px 16px 8px',
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.text,
  },
  searchContainer: {
    padding: '0 12px 12px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 24,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: 20,
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: 'none',
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    fontSize: 14,
    outline: 'none',
  },
  tabs: {
    display: 'flex',
    padding: '0 12px 12px',
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: '8px 16px',
    border: 'none',
    borderRadius: 20,
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  list: {
    flex: 1,
    overflow: 'auto',
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
    fontSize: 48,
    marginBottom: 8,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 600,
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
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: 500,
    color: COLORS.text,
  },
  nameBold: {
    fontWeight: 700,
  },
  time: {
    fontSize: 12,
    color: COLORS.time,
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 160,
    marginTop: 2,
  },
  lastMessageBold: {
    color: COLORS.text,
    fontWeight: 500,
  },
  badge: {
    backgroundColor: COLORS.accent,
    color: 'white',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: 500,
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
  },
};