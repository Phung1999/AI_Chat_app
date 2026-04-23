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

async function createGroup(req, res) {
  try {
    const { name, participantIds } = req.body;
    if (!name || !participantIds || participantIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Group requires name and at least 2 members' }
      });
    }
    const conversation = conversationService.createGroupConversation(
      req.userId,
      name,
      participantIds
    );
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create group' }
    });
  }
}

async function getGroupMembers(req, res) {
  try {
    const members = conversationService.getGroupMembers(parseInt(req.params.id));
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get members' }
    });
  }
}

async function addMember(req, res) {
  try {
    const { userId: newMemberId } = req.body;
    const conversation = conversationService.addMemberToGroup(
      parseInt(req.params.id),
      req.userId,
      newMemberId
    );
    res.json({ success: true, data: conversation });
  } catch (error) {
    if (error.message.includes('Not a group') || error.message.includes('already in')) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: error.message }
      });
    }
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to add member' }
    });
  }
}

async function removeMember(req, res) {
  try {
    conversationService.removeMemberFromGroup(
      parseInt(req.params.id),
      req.userId,
      parseInt(req.params.userId)
    );
    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to remove member' }
    });
  }
}

async function leaveGroup(req, res) {
  try {
    conversationService.leaveGroup(parseInt(req.params.id), req.userId);
    res.json({ success: true, data: { message: 'Left group' } });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to leave group' }
    });
  }
}

module.exports = { getConversations, getOrCreateConversation, createGroup, getGroupMembers, addMember, removeMember, leaveGroup, getMessages, sendMessage, markAsRead };