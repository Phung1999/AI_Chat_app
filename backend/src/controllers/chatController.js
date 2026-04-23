const { conversationService, messageService } = require('../services/chatService');

async function getConversations(req, res) {
  try {
    const conversations = conversationService.getUserConversations(req.userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get conversations' }
    });
  }
}

async function getOrCreateConversation(req, res) {
  try {
    const { participantId } = req.body;
    const conversation = conversationService.getOrCreateDirectConversation(req.userId, participantId);
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create conversation' }
    });
  }
}

async function getMessages(req, res) {
  try {
    const { limit, offset } = req.query;
    const messages = messageService.getMessages(
      parseInt(req.params.id),
      req.userId,
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json({ success: true, data: messages });
  } catch (error) {
    if (error.message === 'Not a participant of this conversation') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: error.message }
      });
    }
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get messages' }
    });
  }
}

async function sendMessage(req, res) {
  try {
    const { content, messageType, fileUrl } = req.body;
    const message = messageService.createMessage(
      parseInt(req.params.id),
      req.userId,
      content,
      messageType || 'text',
      fileUrl
    );
    res.json({ success: true, data: message });
  } catch (error) {
    if (error.message === 'Not a participant of this conversation') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: error.message }
      });
    }
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to send message' }
    });
  }
}

async function markAsRead(req, res) {
  try {
    messageService.markMessagesAsRead(parseInt(req.params.id), req.userId);
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark as read' }
    });
  }
}

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage, markAsRead };