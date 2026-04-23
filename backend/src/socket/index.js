const userService = require('../services/userService');
const { messageService, conversationService } = require('../services/chatService');
const callService = require('../services/callService');
const authService = require('../services/authService');

const onlineUsers = new Map();

function setupSocket(io) {
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.userId = parseInt(userId);
      next();
    } else {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    onlineUsers.set(socket.userId, socket.id);
    userService.updateUserStatus(socket.userId, 1);
    io.emit('user_online', { userId: socket.userId });

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType, fileUrl } = data;
        const message = messageService.createMessage(
          conversationId,
          socket.userId,
          content,
          messageType || 'text',
          fileUrl
        );

        io.to(`conversation_${conversationId}`).emit('new_message', {
          message,
          conversationId
        });

        const conversation = conversationService.getConversationById(conversationId);
        conversation?.participants.forEach(p => {
          if (p.id !== socket.userId) {
            const recipientSocket = onlineUsers.get(p.id);
            if (recipientSocket) {
              io.to(recipientSocket).emit('notification', {
                type: 'new_message',
                conversationId,
                message
              });
            }
          }
        });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('typing', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId
      });
    });

    socket.on('stop_typing', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId: socket.userId
      });
    });

    socket.on('call_user', async (data) => {
      try {
        const { calleeId, callType } = data;
        const callLog = callService.createCallLog(socket.userId, calleeId, callType || 'video');

        const caller = authService.getProfile(socket.userId);
        const calleeSocket = onlineUsers.get(calleeId);

        if (calleeSocket) {
          io.to(calleeSocket).emit('incoming_call', {
            callId: callLog.id,
            caller,
            callType: callType || 'video'
          });
        }

        const callerSocket = onlineUsers.get(socket.userId);
        io.to(callerSocket).emit('call_initiated', {
          callId: callLog.id,
          calleeId
        });
      } catch (error) {
        console.error('Call user error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('accept_call', async (data) => {
      try {
        const { callId } = data;
        callService.updateCallStatus(callId, 'accepted');

        const callLog = callService.getCallLogById(callId);
        const callerSocket = onlineUsers.get(callLog.caller_id);

        if (callerSocket) {
          io.to(callerSocket).emit('call_accepted', {
            callId,
            calleeId: socket.userId
          });
        }

        io.to(onlineUsers.get(socket.userId)).emit('call_started', {
          callId,
          isInitiator: false
        });
      } catch (error) {
        console.error('Accept call error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('decline_call', async (data) => {
      try {
        const { callId } = data;
        callService.updateCallStatus(callId, 'declined');

        const callLog = callService.getCallLogById(callId);
        const callerSocket = onlineUsers.get(callLog.caller_id);

        if (callerSocket) {
          io.to(callerSocket).emit('call_declined', {
            callId,
            reason: 'declined'
          });
        }
      } catch (error) {
        console.error('Decline call error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('end_call', async (data) => {
      try {
        const { callId } = data;
        callService.updateCallStatus(callId, 'ended');

        io.emit('call_ended', { callId });
      } catch (error) {
        console.error('End call error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('offer', (data) => {
      const { calleeId, sdp } = data;
      const calleeSocket = onlineUsers.get(calleeId);
      if (calleeSocket) {
        io.to(calleeSocket).emit('offer', {
          callerId: socket.userId,
          sdp
        });
      }
    });

    socket.on('answer', (data) => {
      const { callerId, sdp } = data;
      const callerSocket = onlineUsers.get(callerId);
      if (callerSocket) {
        io.to(callerSocket).emit('answer', {
          calleeId: socket.userId,
          sdp
        });
      }
    });

    socket.on('ice_candidate', (data) => {
      const { targetId, candidate } = data;
      const targetSocket = onlineUsers.get(targetId);
      if (targetSocket) {
        io.to(targetSocket).emit('ice_candidate', {
          senderId: socket.userId,
          candidate
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      onlineUsers.delete(socket.userId);
      userService.updateUserStatus(socket.userId, 0);
      io.emit('user_offline', { userId: socket.userId });
    });
  });

  return io;
}

module.exports = { setupSocket, onlineUsers };