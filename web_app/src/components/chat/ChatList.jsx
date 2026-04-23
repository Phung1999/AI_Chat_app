import { useState, useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { socketService } from '../../services/socket';
import { COLORS } from '../../services/constants';

export default function ChatList({ onSelectConversation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const { user } = useAuthStore();
  const { conversations, loadConversations, searchUsers, contacts, loadContacts } = useChatStore();

  useEffect(() => {
    loadConversations();
    loadContacts();

    socketService.on('friend_request', (data) => {
      setFriendRequests((prev) => [...prev, data]);
      setShowRequests(true);
    });

    socketService.on('friend_accepted', (data) => {
      loadContacts();
      loadConversations();
    });

    return () => {
      socketService.off('friend_request');
      socketService.off('friend_accepted');
    };
  }, [loadConversations, loadContacts]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results.filter((u) => u.id !== user?.id));
    setIsSearching(false);
  };

  const handleAddFriend = (u) => {
    socketService.addFriend(u.id);
    setSearchResults((prev) => prev.filter((r) => r.id !== u.id));
  };

  const handleAcceptFriend = (request) => {
    socketService.acceptFriend(request.contactId, request.from.id);
    setFriendRequests((prev) => prev.filter((r) => r.contactId !== request.contactId));
  };

  const handleDeclineFriend = (request) => {
    socketService.declineFriend(request.contactId, request.from.id);
    setFriendRequests((prev) => prev.filter((r) => r.contactId !== request.contactId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    const { createGroup } = useChatStore.getState();
    const conversation = await createGroup(groupName, selectedMembers);
    if (conversation) {
      onSelectConversation?.(conversation);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedMembers([]);
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
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
        <div style={styles.headerActions}>
          <button
            style={styles.addFriendMainBtn}
            onClick={() => setShowGroupModal(true)}
            title="Create group"
          >
            <span className="material-symbols-rounded">group_add</span>
          </button>
          <button
            style={styles.addFriendMainBtn}
            onClick={() => setShowRequests(true)}
            title="Add new friend"
          >
            <span className="material-symbols-rounded">person_add</span>
          </button>
          {friendRequests.length > 0 && (
            <button
              style={styles.requestBtn}
              onClick={() => setShowRequests(true)}
            >
              <span className="material-symbols-rounded">notifications</span>
              <span style={styles.badge}>{friendRequests.length}</span>
            </button>
          )}
        </div>
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
        <button onClick={handleSearch} style={styles.searchBtn}>
          <span className="material-symbols-rounded">search</span>
        </button>
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
              <button
                style={styles.addFriendBtn}
                onClick={(e) => { e.stopPropagation(); handleAddFriend(u); }}
                title="Add friend"
              >
                <span className="material-symbols-rounded">person_add</span>
              </button>
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          <div style={styles.empty}>
            <span className="material-symbols-rounded" style={styles.emptyIcon}>chat</span>
            <p>No conversations yet</p>
            <p style={styles.emptyHint}>Search for users to add friends</p>
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

      {showRequests && (
        <div style={styles.modalOverlay} onClick={() => setShowRequests(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.addFriendHeader}>
              <span style={styles.addFriendTitle}>Add Friends</span>
              <button onClick={() => setShowRequests(false)} style={styles.closeRequests}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div style={styles.addFriendSearch}>
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={styles.addFriendSearchInput}
                autoFocus
              />
            </div>
            <div style={styles.addFriendList}>
              {isSearching ? (
                <div style={styles.empty}>Searching...</div>
              ) : searchResults.length === 0 ? (
                <div style={styles.empty}>No users found</div>
              ) : (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    style={styles.requestItem}
                  >
                    <div style={styles.requestAvatar}>
                      {(u.display_name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div style={styles.requestInfo}>
                      <div style={styles.requestName}>{u.display_name || u.email}</div>
                      <div style={styles.requestEmail}>{u.email}</div>
                    </div>
                    <button
                      style={styles.acceptBtn}
                      onClick={() => handleAddFriend(u)}
                      title="Send friend request"
                    >
                      <span className="material-symbols-rounded">person_add</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showGroupModal && (
        <div style={styles.modalOverlay} onClick={() => setShowGroupModal(false)}>
          <div style={styles.groupModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.addFriendHeader}>
              <span style={styles.addFriendTitle}>Create Group</span>
              <button onClick={() => setShowGroupModal(false)} style={styles.closeRequests}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div style={styles.addFriendSearch}>
              <input
                type="text"
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={styles.addFriendSearchInput}
              />
            </div>
            <div style={styles.groupMembersHeader}>
              <span>Select members (at least 2)</span>
              <span style={styles.memberCount}>{selectedMembers.length} selected</span>
            </div>
            <div style={styles.addFriendList}>
              {contacts.length === 0 ? (
                <div style={styles.empty}>No friends yet. Add friends first!</div>
              ) : (
                contacts.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      ...styles.requestItem,
                      ...(selectedMembers.includes(u.id) ? styles.selectedMember : {}),
                    }}
                    onClick={() => toggleMemberSelection(u.id)}
                  >
                    <div style={styles.requestAvatar}>
                      {(u.display_name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div style={styles.requestInfo}>
                      <div style={styles.requestName}>{u.display_name || u.email}</div>
                      <div style={styles.requestEmail}>{u.email}</div>
                    </div>
                    <div style={styles.checkbox}>
                      {selectedMembers.includes(u.id) && (
                        <span className="material-symbols-rounded" style={styles.checkIcon}>check</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={styles.groupFooter}>
              <button
                style={{
                  ...styles.createGroupBtn,
                  ...(selectedMembers.length < 2 || !groupName.trim() ? styles.createGroupBtnDisabled : {}),
                }}
                onClick={handleCreateGroup}
                disabled={selectedMembers.length < 2 || !groupName.trim()}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
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
    position: 'relative',
  },
  header: {
    padding: '16px 16px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.text,
  },
  headerActions: {
    display: 'flex',
    gap: 8,
  },
  addFriendMainBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  requestBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#f0f2f5',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accent,
    color: 'white',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 5px',
    borderRadius: 10,
    minWidth: 16,
    textAlign: 'center',
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
  searchBtn: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: COLORS.primary,
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
  emptyHint: {
    fontSize: 13,
    marginTop: 4,
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
  addFriendBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  requestsPanel: {
    position: 'absolute',
    top: 0,
    left: '100%',
    width: 280,
    height: '100vh',
    backgroundColor: 'white',
    borderRight: '1px solid #e0e0e0',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  },
  addFriendModal: {
    position: 'absolute',
    top: 0,
    left: '100%',
    width: 280,
    height: '100vh',
    backgroundColor: 'white',
    borderRight: '1px solid #e0e0e0',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
  },
  addFriendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  addFriendTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.text,
    margin: 0,
  },
  addFriendSearch: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
  },
  addFriendSearchInput: {
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    fontSize: 14,
    outline: 'none',
  },
  addFriendList: {
    flex: 1,
    overflow: 'auto',
  },
  requestsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    fontWeight: 600,
  },
  closeRequests: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
  },
  requestItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: COLORS.secondary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 600,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 14,
    fontWeight: 500,
    color: COLORS.text,
  },
  requestEmail: {
    fontSize: 12,
    color: '#888',
  },
  requestActions: {
    display: 'flex',
    gap: 8,
  },
  acceptBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: COLORS.accent,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 1000,
  },
  modalContent: {
    width: 320,
    maxHeight: 500,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    marginTop: 60,
    marginLeft: 64,
  },
  groupModalContent: {
    width: 340,
    maxHeight: 550,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    marginTop: 60,
    marginLeft: 64,
    display: 'flex',
    flexDirection: 'column',
  },
  groupMembersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: 13,
    color: '#666',
  },
  memberCount: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 12,
  },
  selectedMember: {
    backgroundColor: '#e8f5e9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: COLORS.accent,
    fontSize: 16,
  },
  groupFooter: {
    padding: 16,
    borderTop: '1px solid #e0e0e0',
  },
  createGroupBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: COLORS.primary,
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  createGroupBtnDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
};