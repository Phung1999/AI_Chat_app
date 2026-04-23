import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../services/constants';

export default function ChatPanel({ conversation, messages, onSendMessage, onBack }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthStore();

  const otherUser = conversation?.participants?.find((p) => p.id !== user?.id);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage?.(input.trim());
    setInput('');
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
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
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

  if (!conversation) {
    return (
      <div style={styles.empty}>
        <span className="material-symbols-rounded" style={styles.emptyIcon}>chat_bubble_outline</span>
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages || []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {onBack && (
          <button onClick={onBack} style={styles.backBtn}>
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        )}
        <div style={styles.avatar}>
          {(otherUser?.display_name || otherUser?.email || 'U')[0].toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{otherUser?.display_name || otherUser?.email}</div>
          <div style={styles.userStatus}>
            {otherUser?.online_status === 1 ? 'Online' : 'Offline'}
          </div>
        </div>
        <div style={styles.actions}>
          <button style={styles.actionBtn} title="Call">
            <span className="material-symbols-rounded">call</span>
          </button>
          <button style={styles.actionBtn} title="Video">
            <span className="material-symbols-rounded">videocam</span>
          </button>
          <button style={styles.actionBtn} title="More">
            <span className="material-symbols-rounded">more_vert</span>
          </button>
        </div>
      </div>

      <div style={styles.messageList}>
        {messageGroups.map(([date, msgs]) => (
          <div key={date}>
            <div style={styles.dateDivider}>
              <span>{date}</span>
            </div>
            {msgs.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageRow,
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      ...styles.messageBubble,
                      ...(isOwn ? styles.bubbleSent : styles.bubbleReceived),
                    }}
                  >
                    <div style={styles.messageContent}>{msg.content}</div>
                    <div style={styles.messageMeta}>
                      <span style={styles.messageTime}>{formatTime(msg.created_at)}</span>
                      {isOwn && (
                        <span style={styles.messageStatus}>
                          {msg.read_by ? (
                            <span className="material-symbols-rounded" style={styles.seenIcon}>done_all</span>
                          ) : (
                            <span className="material-symbols-rounded" style={styles.sentIcon}>done</span>
                          )}
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

      <div style={styles.inputArea}>
        <button style={styles.attachBtn} title="Attach">
          <span className="material-symbols-rounded">attach_file</span>
        </button>
        <button style={styles.emojiBtn} title="Emoji">
          <span className="material-symbols-rounded">emoji_emotions</span>
        </button>
        <textarea
          ref={inputRef}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.input}
          rows={1}
        />
        <button
          onClick={handleSend}
          style={{
            ...styles.sendBtn,
            ...(input.trim() ? styles.sendBtnActive : {}),
          }}
        >
          <span className="material-symbols-rounded">
            input.trim() ? 'send' : 'mic'
          </span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 600,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.text,
  },
  userStatus: {
    fontSize: 13,
    color: COLORS.time,
  },
  actions: {
    display: 'flex',
    gap: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  messageList: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 24px',
    backgroundColor: '#ECE5DD',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0H18v4h-2v-4H0v2h4v4h2v4h4v-4h2v4h4v-4h2v4h4v-4h2v4h4v-4h2v-4h-4zm0 60v-4h-4v4h4v4h4v-4h4v-4h-4v-4h-4v4h-4zm0-60V0h-4v4h-4v4H0v2h4v4h4v4h4v-4h4v-4h4v-4h4v4h4v4h4v4h4v-4h4v-4h-4v-4h-4zm0 60v-4h-4v4h4v4h4v-4h4v-4h-4v-4h-4v4h-4zm0-60v-4h-4v4h4v4h4v-4h4v-4h-4v-4h-4v4h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  },
  dateDivider: {
    display: 'flex',
    justifyContent: 'center',
    margin: '16px 0',
  },
  dateDividerText: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    color: '#666',
  },
  messageRow: {
    display: 'flex',
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '8px 12px',
    borderRadius: 16,
    position: 'relative',
  },
  bubbleSent: {
    backgroundColor: COLORS.bubbleSent,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  messageMeta: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.time,
  },
  messageStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  sentIcon: {
    fontSize: 14,
    color: COLORS.time,
  },
  seenIcon: {
    fontSize: 14,
    color: COLORS.accent,
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    fontSize: 15,
    outline: 'none',
    resize: 'none',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: '#f0f2f5',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  sendBtnActive: {
    backgroundColor: COLORS.primary,
    color: 'white',
  },
};