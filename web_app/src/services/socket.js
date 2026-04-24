import { io } from 'socket.io-client';
import { SOCKET_URL, STORAGE_KEYS } from './constants';

let socket = null;

export const initSocket = (userId) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { userId: userId.toString() },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const socketService = {
  joinConversation: (conversationId) => {
    socket?.emit('join_conversation', conversationId);
  },

  leaveConversation: (conversationId) => {
    socket?.emit('leave_conversation', conversationId);
  },

  sendMessage: (conversationId, content, type = 'text', fileUrl = null) => {
    socket?.emit('send_message', { conversationId, content, messageType: type, fileUrl });
  },

  sendTyping: (conversationId) => {
    socket?.emit('typing', { conversationId });
  },

  sendStopTyping: (conversationId) => {
    socket?.emit('stop_typing', { conversationId });
  },

  addFriend: (targetUserIdOrEmail) => {
    console.log('[SOCKET] addFriend called:', targetUserIdOrEmail, 'socket connected:', socket?.connected);
    socket?.emit('add_friend', { targetEmail: targetUserIdOrEmail });
  },

  acceptFriend: (contactId, fromUserId) => {
    socket?.emit('accept_friend', { contactId, fromUserId });
  },

  declineFriend: (contactId, fromUserId) => {
    socket?.emit('decline_friend', { contactId, fromUserId });
  },

  createGroup: (name, participantIds) => {
    socket?.emit('create_group', { name, participantIds });
  },

  callUser: (calleeId, callType = 'video') => {
    socket?.emit('call_user', { calleeId, callType });
  },

  acceptCall: (callId) => {
    socket?.emit('accept_call', { callId });
  },

  declineCall: (callId) => {
    socket?.emit('decline_call', { callId });
  },

  endCall: (callId) => {
    socket?.emit('end_call', { callId });
  },

  sendOffer: (calleeId, sdp) => {
    socket?.emit('offer', { calleeId, sdp });
  },

  sendAnswer: (callerId, sdp) => {
    socket?.emit('answer', { callerId, sdp });
  },

  sendIceCandidate: (targetId, candidate) => {
    socket?.emit('ice_candidate', { targetId, candidate });
  },

  on: (event, callback) => {
    socket?.on(event, callback);
  },

  off: (event, callback) => {
    socket?.off(event, callback);
  },
};