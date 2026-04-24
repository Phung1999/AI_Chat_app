import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { socketService } from '../../services/socket';

export default function ChatPanel({ conversation, messages, onSendMessage, onBack, isLoading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthStore();

  const isGroup = conversation?.type === 'group';
  const otherUser = isGroup
    ? null
    : conversation?.participants?.find((p) => p.id !== user?.id);

  const displayName = isGroup
    ? conversation?.name
    : (otherUser?.display_name || otherUser?.email || 'Unknown');

  const isOnline = !isGroup && otherUser?.online_status === 1;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage?.(input.trim());
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return Object.entries(groups);
  };

  const handleCall = () => {
    if (isGroup) return;
    const otherId = otherUser?.id;
    if (otherId) {
      socketService.emit('call_user', { targetUserId: otherId, type: 'video' });
    }
  };

  const handleVoiceCall = () => {
    if (isGroup) return;
    const otherId = otherUser?.id;
    if (otherId) {
      socketService.emit('call_user', { targetUserId: otherId, type: 'voice' });
    }
  };

  /* ─── EMPTY STATE ─── */
  if (!conversation) {
    return (
      <div className="chatpanel-empty">
        <div className="chatpanel-empty-illust">
          <div className="chatpanel-empty-circle1" />
          <div className="chatpanel-empty-circle2" />
          <span className="material-symbols-rounded chatpanel-empty-icon">
            chat_bubble_outline
          </span>
        </div>
        <h3 className="chatpanel-empty-title">Chọn cuộc hội thoại</h3>
        <p className="chatpanel-empty-subtitle">
          Chọn một cuộc trò chuyện hoặc bắt đầu chat mới
        </p>
      </div>
    );
  }

  /* ─── LOADING STATE ─── */
  if (isLoading) {
    return (
      <div className="chatpanel-container">
        <div className="skeleton-panel-header">
          <div className="skeleton-panel-avatar" />
          <div className="skeleton-panel-info">
            <div className="skeleton-panel-name" />
            <div className="skeleton-panel-status" />
          </div>
        </div>
        <div className="skeleton-messages">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`skeleton-message-row ${i % 2 === 0 ? 'skeleton-message-row--sent' : ''}`}
            >
              <div className={`skeleton-message-bubble ${i % 2 === 0 ? 'skeleton-message-bubble--sent' : 'skeleton-message-bubble--received'} skeleton-message-width--${i % 3 + 1}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages || []);

  return (
    <div className="chatpanel-container">
      {/* ── HEADER ── */}
      <div className="chatpanel-header">
        {onBack && (
          <button className="chatpanel-back-btn" onClick={onBack}>
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        )}

        <div className="chatpanel-header-avatar-wrap">
          <div className="chatpanel-header-avatar">
            {isGroup ? (
              <span className="material-symbols-rounded" style={{ fontSize: 22, color: 'white' }}>
                groups
              </span>
            ) : (
              <span className="chatpanel-header-avatar-text">
                {displayName[0].toUpperCase()}
              </span>
            )}
          </div>
          {!isGroup && isOnline && <div className="chatpanel-online-indicator" />}
        </div>

        <div className="chatpanel-header-info">
          <span className="chatpanel-header-name">{displayName}</span>
          <span className={`chatpanel-header-status ${isOnline ? 'chatpanel-header-status--online' : ''}`}>
            {isGroup
              ? `${conversation.participants?.length || 0} thành viên`
              : isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </span>
        </div>

        <div className="chatpanel-header-actions">
          <button className="chatpanel-action-btn" onClick={handleVoiceCall} title="Gọi thoại">
            <span className="material-symbols-rounded" style={{ fontSize: 22 }}>call</span>
          </button>
          <button className="chatpanel-action-btn" onClick={handleCall} title="Gọi video">
            <span className="material-symbols-rounded" style={{ fontSize: 22 }}>videocam</span>
          </button>
          <button className="chatpanel-action-btn" title="Thêm">
            <span className="material-symbols-rounded" style={{ fontSize: 22 }}>more_vert</span>
          </button>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="chatpanel-messages scrollbar-thin">
        {messageGroups.length === 0 && (
          <div className="chatpanel-no-messages">
            <span className="material-symbols-rounded" style={{ fontSize: 36, color: 'var(--color-text-muted)' }}>
              waving_hand
            </span>
            <p>Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        )}

        {messageGroups.map(([date, msgs]) => (
          <div key={date}>
            <div className="chatpanel-date-divider">
              <div className="chatpanel-date-divider-line" />
              <span className="chatpanel-date-divider-text">{date}</span>
              <div className="chatpanel-date-divider-line" />
            </div>

            {msgs.map((msg, idx) => {
              const isOwn = msg.sender_id === user?.id;
              const showAvatar = !isOwn && (idx === 0 || msgs[idx - 1]?.sender_id !== msg.sender_id);

              return (
                <div
                  key={msg.id}
                  className={`chatpanel-message-row ${isOwn ? 'chatpanel-message-row--sent' : 'chatpanel-message-row--received'}`}
                >
                  {!isOwn && showAvatar && (
                    <div className="chatpanel-msg-avatar">
                      {(msg.sender?.display_name || msg.sender?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}

                  <div className={`chatpanel-message-bubble ${isOwn ? 'chatpanel-message-bubble--sent' : 'chatpanel-message-bubble--received'}`}>
                    {isGroup && !isOwn && showAvatar && (
                      <span className="chatpanel-sender-name">
                        {msg.sender?.display_name || msg.sender?.email || 'User'}
                      </span>
                    )}
                    <span className="chatpanel-message-text">{msg.content}</span>
                    <div className="chatpanel-message-meta">
                      <span className={`chatpanel-message-time ${isOwn ? 'chatpanel-message-time--sent' : 'chatpanel-message-time--received'}`}>
                        {formatTime(msg.created_at)}
                      </span>
                      {isOwn && (
                        <span className={`material-symbols-rounded chatpanel-read-icon ${msg.read_by ? 'chatpanel-read-icon--read' : 'chatpanel-read-icon--unread'}`}
                          style={{ fontVariationSettings: "'FIL' 1, 'wght' 400" }}>
                          {msg.read_by ? 'done_all' : 'done'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="chatpanel-input-area">
        <button className="chatpanel-icon-btn" title="Đính kèm file">
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>attach_file</span>
        </button>
        <button className="chatpanel-icon-btn" title="Emoji">
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>sentiment_satisfied</span>
        </button>

        <div className="chatpanel-input-wrapper">
          <textarea
            ref={inputRef}
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chatpanel-text-input"
          />
        </div>

        <button
          onClick={handleSend}
          className={`chatpanel-send-btn ${input.trim() ? 'chatpanel-send-btn--active' : ''}`}
          title={input.trim() ? 'Gửi' : 'Micro'}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>
            {input.trim() ? 'send' : 'mic'}
          </span>
        </button>
      </div>
    </div>
  );
}