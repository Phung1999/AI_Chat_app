import useAuthStore from '../../store/authStore';
import { COLORS } from '../../services/constants';

export default function MessageBubble({ message }) {
  const { user } = useAuthStore();
  const isMe = message.sender_id === user?.id;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ ...styles.container, ...(isMe ? styles.containerRight : styles.containerLeft) }}>
      {!isMe && (
        <div style={styles.avatar}>
          {(message.sender_name || message.sender_email || 'U')[0].toUpperCase()}
        </div>
      )}

      <div style={{ ...styles.bubble, ...(isMe ? styles.bubbleRight : styles.bubbleLeft) }}>
        {!isMe && (
          <div style={styles.senderName}>{message.sender_name}</div>
        )}
        <div style={styles.content}>{message.content}</div>
        <div style={styles.meta}>
          <span style={styles.time}>{formatTime(message.created_at)}</span>
          {isMe && (
            <span className="material-symbols-rounded" style={styles.readIcon}>
              {message.read_by ? 'done_all' : 'done'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    marginBottom: 8,
    padding: '0 16px',
  },
  containerLeft: {
    justifyContent: 'flex-start',
  },
  containerRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  bubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  bubbleLeft: {
    backgroundColor: COLORS.bubbleReceived,
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: COLORS.bubbleSent,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.primary,
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    color: COLORS.text,
    wordBreak: 'break-word',
  },
  meta: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: COLORS.time,
  },
  readIcon: {
    fontSize: 14,
    color: COLORS.time,
  },
};