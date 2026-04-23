const { runQuery, getOne, getAll, getLastInsertRowId, getChanges } = require('../config/database');

class ConversationService {
  getUserConversations(userId) {
    const conversations = getAll(
      `SELECT c.id, c.type, c.name, c.created_at
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ?
        ORDER BY c.created_at DESC`,
      [userId]
    );

    return conversations.map(conv => {
      const participants = this.getConversationParticipants(conv.id);
      const lastMessage = getOne(
        `SELECT m.*, u.email as sender_email, u.display_name as sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.conversation_id = ?
         ORDER BY m.created_at DESC LIMIT 1`,
        [conv.id]
      );
      const unreadCount = getOne(
        `SELECT COUNT(*) as count FROM messages m WHERE m.conversation_id = ? AND m.sender_id != ? AND (m.read_by IS NULL OR m.read_by NOT LIKE '%' || ? || '%')`,
        [conv.id, userId, userId]
      );
      return {
        ...conv,
        participants,
        lastMessage,
        unreadCount: unreadCount?.count || 0
      };
    });
  }

  getConversationParticipants(conversationId) {
    return getAll(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.online_status
       FROM conversation_participants cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.conversation_id = ?`,
      [conversationId]
    );
  }

  getOrCreateDirectConversation(userId, participantId) {
    const existing = getOne(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
       WHERE c.type = 'direct'`,
      [userId, participantId]
    );

    if (existing) {
      return this.getConversationById(existing.id);
    }

    runQuery("INSERT INTO conversations (type) VALUES ('direct')");
    const conversationId = getLastInsertRowId();

    runQuery(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
      [conversationId, userId]
    );
    runQuery(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
      [conversationId, participantId]
    );

    return this.getConversationById(conversationId);
  }

  getConversationById(conversationId) {
    const conversation = getOne('SELECT * FROM conversations WHERE id = ?', [conversationId]);
    if (!conversation) return null;
    const participants = this.getConversationParticipants(conversationId);
    return { ...conversation, participants };
  }
}

class MessageService {
  getMessages(conversationId, userId, limit = 50, offset = 0) {
    const participant = getOne(
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );
    if (!participant) {
      throw new Error('Not a participant of this conversation');
    }

    return getAll(
      `SELECT m.*, u.email as sender_email, u.display_name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );
  }

  createMessage(conversationId, senderId, content, messageType = 'text', fileUrl = null) {
    runQuery(
      'INSERT INTO messages (conversation_id, sender_id, content, message_type, file_url) VALUES (?, ?, ?, ?, ?)',
      [conversationId, senderId, content, messageType, fileUrl]
    );
    const messageId = getLastInsertRowId();
    return getOne(
      `SELECT m.*, u.email as sender_email, u.display_name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId]
    );
  }

  markMessagesAsRead(conversationId, userId) {
    const messages = getAll(
      'SELECT id, read_by FROM messages WHERE conversation_id = ? AND sender_id != ?',
      [conversationId, userId]
    );

    for (const msg of messages) {
      const readBy = msg.read_by ? JSON.parse(msg.read_by) : [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        runQuery('UPDATE messages SET read_by = ? WHERE id = ?', [JSON.stringify(readBy), msg.id]);
      }
    }
  }
}

const conversationService = new ConversationService();
const messageService = new MessageService();

module.exports = { conversationService, messageService };