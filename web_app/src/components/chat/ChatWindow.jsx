import { useState, useRef, useEffect } from 'react';
import { socketService } from '../../services/socket';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import MessageBubble from './MessageBubble';
import { COLORS } from '../../services/constants';

export default function ChatWindow({ conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuthStore();
  const { loadMessages, addMessage } = useChatStore();

  const otherUser = conversation.participants?.find((p) => p.id !== user?.id);

  useEffect(() => {
    loadMessages(conversation.id).then((msgs) => {
      if (msgs) setMessages(msgs);
    });

    socketService.joinConversation(conversation.id);

    socketService.on('new_message', (data) => {
      if (data.message.conversation_id === conversation.id) {
        setMessages((prev) => [data.message, ...prev]);
      }
    });

    socketService.on('user_typing', (data) => {
      if (data.conversationId === conversation.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socketService.leaveConversation(conversation.id);
      socketService.off('new_message');
      socketService.off('user_typing');
    };
  }, [conversation.id, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socketService.sendMessage(conversation.id, input);
    socketService.sendStopTyping(conversation.id);
    setInput('');
    scrollToBottom();
  };

  const handleTyping = () => {
    if (!isTyping) {
      socketService.sendTyping(conversation.id);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(conversation.id);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {onBack && (
          <button onClick={onBack} style={styles.backBtn}>
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
        )}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {(otherUser?.display_name || otherUser?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={styles.userName}>{otherUser?.display_name || otherUser?.email}</div>
            <div style={styles.userStatus}>
              {isTyping ? 'typing...' : (otherUser?.online_status ? 'online' : 'offline')}
            </div>
          </div>
        </div>
        <button style={styles.callBtn}>
          <span className="material-symbols-rounded">videocam</span>
        </button>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 ? (
          <div style={styles.empty}>No messages yet</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <button style={styles.attachBtn}>
          <span className="material-symbols-rounded">attach_file</span>
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onInput={handleTyping}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          <span className="material-symbols-rounded" style={{ color: COLORS.accent }}>send</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'white',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    gap: 12,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
  },
  userInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
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
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 600,
  },
  userStatus: {
    fontSize: 12,
    color: COLORS.time,
  },
  callBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
  },
  messages: {
    flex: 1,
    overflow: 'auto',
    padding: 16,
    backgroundColor: COLORS.background,
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: 'white',
    gap: 8,
  },
  attachBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    color: '#666',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    fontSize: 15,
    outline: 'none',
  },
  sendBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
  },
};