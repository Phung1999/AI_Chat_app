import { useState, useEffect, useCallback } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { socketService } from '../../services/socket';
import { useDebounce } from '../../hooks/useDebounce';
import { contactsAPI } from '../../services/api';

export default function ChatList({ onSelectConversation, isLoading }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);
  const { user } = useAuthStore();
  const { conversations, loadConversations, searchUsers, contacts, loadContacts } = useChatStore();

  const loadPendingRequests = useCallback(async () => {
    try {
      const res = await contactsAPI.getPending();
      if (res.data?.success) {
        setFriendRequests(res.data.data);
      }
    } catch (err) {
      console.error('Load pending requests error:', err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadContacts();
    loadPendingRequests();

    socketService.on('friend_request', (data) => {
      setFriendRequests((prev) => [...prev, data]);
      setShowRequests(true);
    });

    socketService.on('friend_accepted', () => {
      loadContacts();
      loadConversations();
    });

    return () => {
      socketService.off('friend_request');
      socketService.off('friend_accepted');
    };
  }, [loadConversations, loadContacts, loadPendingRequests]);

  useEffect(() => {
    const doSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await searchUsers(debouncedQuery);
      setSearchResults(results.filter((u) => u.id !== user?.id));
      setIsSearching(false);
    };
    doSearch();
  }, [debouncedQuery, searchUsers, user?.id]);

  const handleAddFriend = async (u) => {
    try {
      console.log('Adding friend, target email:', u.email);
      const res = await contactsAPI.add(u.email);
      console.log('Add friend response:', res.data);
      if (res.data?.success) {
        socketService.addFriend(u.email);
      } else {
        console.error('Add friend failed:', res.data?.error?.message);
      }
    } catch (err) {
      console.error('Add friend error:', err.response?.data || err);
    } finally {
      setSearchResults((prev) => prev.filter((r) => r.id !== u.id));
    }
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
    <div className="chatlist-container">
      <div className="chatlist-header">
        <h2 className="chatlist-title">Messages</h2>
        <div className="chatlist-header-actions">
          <button
            className="chatlist-action-btn"
            onClick={() => setShowGroupModal(true)}
            title="Tạo nhóm"
          >
            <span className="material-symbols-rounded">group_add</span>
          </button>
          <button
            className="chatlist-action-btn chatlist-request-btn"
            onClick={() => setShowRequests(true)}
            title="Thêm bạn"
          >
            <span className="material-symbols-rounded">person_add</span>
          </button>
        </div>
      </div>

      <div className="chatlist-search">
        <span className="material-symbols-rounded chatlist-search-icon">search</span>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="chatlist-search-input"
        />
      </div>

      <div className="chatlist-tabs">
        <button
          className={`chatlist-tab ${activeTab === 'all' ? 'chatlist-tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
        <button
          className={`chatlist-tab ${activeTab === 'unread' ? 'chatlist-tab--active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Chưa đọc
        </button>
      </div>

      <div className="chatlist-list">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-chatlist-item">
                <div className="skeleton-chatlist-avatar" />
                <div className="skeleton-chatlist-content">
                  <div className="skeleton-chatlist-name" />
                  <div className="skeleton-chatlist-msg" />
                </div>
              </div>
            ))}
          </>
        ) : searchResults.length > 0 ? (
          searchResults.map((u) => (
            <div
              key={u.id}
              className="chatlist-item"
              onClick={() => handleSelectUser(u)}
            >
              <div className="chatlist-item-avatar-wrap">
                <div className="chatlist-item-avatar">
                  {(u.display_name || u.email || 'U')[0].toUpperCase()}
                </div>
              </div>
              <div className="chatlist-item-content">
                <div className="chatlist-item-row">
                  <span className="chatlist-item-name">{u.display_name || u.email}</span>
                </div>
                <div className="chatlist-item-row">
                  <span className="chatlist-item-preview">{u.email}</span>
                </div>
              </div>
              <button
                className="modal-item-btn"
                onClick={(e) => { e.stopPropagation(); handleAddFriend(u); }}
                title="Kết bạn"
              >
                <span className="material-symbols-rounded">person_add</span>
              </button>
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          <div className="chatlist-empty">
            <span className="material-symbols-rounded chatlist-empty-icon">chat</span>
            <p>Chưa có cuộc trò chuyện nào</p>
            <p className="chatlist-empty-hint">Tìm kiếm người dùng để kết bạn</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            const displayName = conv.type === 'group'
              ? conv.name
              : (otherUser?.display_name || otherUser?.email || 'Unknown');
            const isOnline = conv.type !== 'group' && otherUser?.online_status === 1;
            const isUnread = conv.unreadCount > 0;
            const lastMsg = conv.lastMessage?.content || 'Chưa có tin nhắn';

            return (
              <div
                key={conv.id}
                className="chatlist-item"
                onClick={() => onSelectConversation?.(conv)}
              >
                <div className="chatlist-item-avatar-wrap">
                  <div className={`chatlist-item-avatar ${conv.type === 'group' ? 'chatlist-item-avatar--group' : ''}`}>
                    {displayName[0].toUpperCase()}
                  </div>
                  {isOnline && <div className="chatlist-online-dot" />}
                </div>
                <div className="chatlist-item-content">
                  <div className="chatlist-item-row">
                    <span className={`chatlist-item-name ${isUnread ? 'chatlist-item-name--unread' : ''}`}>
                      {displayName}
                    </span>
                    <span className="chatlist-item-time">
                      {formatTime(conv.lastMessage?.created_at)}
                    </span>
                  </div>
                  <div className="chatlist-item-row">
                    <span className={`chatlist-item-preview ${isUnread ? 'chatlist-item-preview--unread' : ''}`}>
                      {conv.type === 'group' && conv.lastMessage?.sender
                        ? `${conv.lastMessage.sender.display_name || conv.lastMessage.sender.email}: `
                        : ''}
                      {lastMsg}
                    </span>
                    {isUnread && <span className="chatlist-item-badge">{conv.unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD FRIENDS MODAL */}
      {showRequests && (
        <div className="modal-overlay" onClick={() => setShowRequests(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Thêm bạn bè</span>
              <button className="modal-close" onClick={() => setShowRequests(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="modal-search">
              <input
                type="text"
                placeholder="Tìm theo email hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="modal-search-input"
                autoFocus
              />
            </div>
            <div className="modal-list">
              {isSearching ? (
                <div className="chatlist-empty">Đang tìm kiếm...</div>
              ) : searchResults.length === 0 ? (
                <div className="chatlist-empty">Không tìm thấy người dùng</div>
              ) : (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="modal-item"
                  >
                    <div className="modal-item-avatar">
                      {(u.display_name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="modal-item-info">
                      <div className="modal-item-name">{u.display_name || u.email}</div>
                      <div className="modal-item-email">{u.email}</div>
                    </div>
                    <button
                      className="modal-item-btn"
                      onClick={() => handleAddFriend(u)}
                      title="Gửi lời kết bạn"
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

      {/* CREATE GROUP MODAL */}
      {showGroupModal && (
        <div className="modal-overlay" onClick={() => setShowGroupModal(false)}>
          <div className="modal-content modal-content--group" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Tạo nhóm chat</span>
              <button className="modal-close" onClick={() => setShowGroupModal(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="modal-search">
              <input
                type="text"
                placeholder="Tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="modal-search-input"
              />
            </div>
            <div className="modal-group-members-header">
              <span>Chọn thành viên (ít nhất 2)</span>
              <span className="modal-member-count">{selectedMembers.length} đã chọn</span>
            </div>
            <div className="modal-list">
              {contacts.length === 0 ? (
                <div className="chatlist-empty">Chưa có bạn bè. Kết bạn trước!</div>
              ) : (
                contacts.map((u) => (
                  <div
                    key={u.id}
                    className={`modal-item ${selectedMembers.includes(u.id) ? 'modal-item--selected' : ''}`}
                    onClick={() => toggleMemberSelection(u.id)}
                  >
                    <div className="modal-item-avatar">
                      {(u.display_name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="modal-item-info">
                      <div className="modal-item-name">{u.display_name || u.email}</div>
                      <div className="modal-item-email">{u.email}</div>
                    </div>
                    <div className={`modal-item-checkbox ${selectedMembers.includes(u.id) ? 'modal-item-checkbox--checked' : ''}`}>
                      {selectedMembers.includes(u.id) && (
                        <span className="material-symbols-rounded modal-check-icon">check</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={handleCreateGroup}
                disabled={selectedMembers.length < 2 || !groupName.trim()}
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}