import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import Navbar from '../components/common/Navbar';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { COLORS } from '../services/constants';

export default function HomePage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getOrCreateConversation, searchUsers } = useChatStore();

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results.filter((u) => u.id !== user?.id));
    setIsSearching(false);
  };

  const startConversation = async (userId) => {
    const conversation = await getOrCreateConversation(userId);
    if (conversation) {
      setSelectedConversation(conversation);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={{ ...styles.sidebar, ...(selectedConversation ? styles.sidebarHidden : {}) }}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Chats</h2>
            <button onClick={() => setShowSearch(true)} style={styles.searchToggle}>
              <span className="material-symbols-rounded">search</span>
            </button>
          </div>

          {showSearch ? (
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={styles.searchInput}
                autoFocus
              />
              <button onClick={handleSearch} style={styles.searchBtn}>
                <span className="material-symbols-rounded">search</span>
              </button>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={styles.closeBtn}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          ) : null}

          {showSearch ? (
            <div style={styles.searchResults}>
              {isSearching ? (
                <div style={styles.loading}>Searching...</div>
              ) : searchResults.length === 0 ? (
                <div style={styles.noResults}>No users found</div>
              ) : (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    style={styles.searchResultItem}
                    onClick={() => startConversation(u.id)}
                  >
                    <div style={styles.searchAvatar}>
                      {(u.display_name || u.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.searchName}>{u.display_name || u.email}</div>
                      <div style={styles.searchEmail}>{u.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <ConversationList onSelect={handleSelectConversation} />
          )}
        </div>

        <div style={{ ...styles.main, ...(!selectedConversation ? styles.mainHidden : {}) }}>
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} onBack={handleBack} />
          ) : (
            <div style={styles.emptyMain}>
              <span className="material-symbols-rounded" style={styles.emptyIcon}>chat</span>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 360,
    borderRight: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  sidebarHidden: {
    '@media (maxWidth: 768px)': {
      display: 'none',
    },
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f0f0f0',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 0,
  },
  searchToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    display: 'flex',
    padding: '12px 16px',
    gap: 8,
    borderBottom: '1px solid #f0f0f0',
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    fontSize: 14,
    outline: 'none',
  },
  searchBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: COLORS.primary,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
  },
  searchResults: {
    flex: 1,
    overflow: 'auto',
  },
  searchResultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
  },
  searchAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchName: {
    fontSize: 15,
    fontWeight: 500,
  },
  searchEmail: {
    fontSize: 13,
    color: '#999',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: 24,
    color: '#999',
  },
  noResults: {
    display: 'flex',
    justifyContent: 'center',
    padding: 24,
    color: '#999',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLORS.background,
  },
  mainHidden: {
    display: 'flex',
  },
  emptyMain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
};