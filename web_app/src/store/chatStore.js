import { create } from 'zustand';
import { conversationsAPI, usersAPI, contactsAPI } from '../services/api';
import { socketService } from '../services/socket';

const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: {},
  typingUsers: {},
  onlineUsers: [],
  allUsers: [],
  contacts: [],
  pendingRequests: [],
  isLoading: false,
  error: null,

  loadConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await conversationsAPI.getAll();
      if (response.data.success) {
        set({ conversations: response.data.data, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load conversations', isLoading: false });
    }
  },

  loadContacts: async () => {
    try {
      const response = await contactsAPI.getAll();
      if (response.data.success) {
        set({ contacts: response.data.data });
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  },

  loadPendingRequests: async () => {
    try {
      const response = await contactsAPI.getPending();
      if (response.data.success) {
        set({ pendingRequests: response.data.data });
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  },

  addContact: async (contactId) => {
    try {
      await contactsAPI.add(contactId);
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  },

  acceptContact: async (contactId) => {
    try {
      await contactsAPI.update(contactId, 'accepted');
      await get().loadContacts();
      await get().loadConversations();
    } catch (error) {
      console.error('Failed to accept contact:', error);
    }
  },

  declineContact: async (contactId) => {
    try {
      await contactsAPI.remove(contactId);
    } catch (error) {
      console.error('Failed to decline contact:', error);
    }
  },

  createGroup: async (name, participantIds) => {
    try {
      const response = await conversationsAPI.createGroup(name, participantIds);
      if (response.data.success) {
        const { conversations } = get();
        set({ conversations: [response.data.data, ...conversations] });
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }
    return null;
  },

  loadOnlineUsers: async () => {
    try {
      const response = await usersAPI.getOnline();
      if (response.data.success) {
        set({ onlineUsers: response.data.data || [] });
      }
    } catch (error) {
      console.error('Failed to load online users:', error);
      set({ onlineUsers: [] });
    }
  },

  addOnlineUser: (userId) => {
    set((state) => {
      const exists = state.onlineUsers.some(u => u.id === userId);
      if (exists) return state;
      return { onlineUsers: [...state.onlineUsers, { id: userId, isOnline: true }] };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter(u => u.id !== userId),
    }));
  },

  loadAllUsers: async () => {
    try {
      const response = await usersAPI.getAll();
      if (response.data.success) {
        set({ allUsers: response.data.data });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  loadMessages: async (conversationId) => {
    try {
      const response = await conversationsAPI.getMessages(conversationId);
      if (response.data.success) {
        const messages = response.data.data;
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        }));
        return messages;
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ error: 'Failed to load messages' });
    }
    return [];
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
    if (conversation) {
      socketService.joinConversation(conversation.id);
    }
  },

  getOrCreateConversation: async (participantId) => {
    try {
      console.log('Creating conversation with participant:', participantId);
      const response = await conversationsAPI.getOrCreate(participantId);
      console.log('API response:', response.data);
      if (response.data.success) {
        const conversation = response.data.data;
        const { conversations } = get();
        const existingIndex = conversations.findIndex((c) => c.id === conversation.id);
        if (existingIndex >= 0) {
          const newConversations = [...conversations];
          newConversations[existingIndex] = conversation;
          set({ conversations: newConversations });
        } else {
          set({ conversations: [conversation, ...conversations] });
        }
        return conversation;
      }
    } catch (error) {
      console.error('Create conversation error:', error);
      set({ error: 'Failed to create conversation' });
    }
    return null;
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      const exists = existingMessages.some((m) => m.id === message.id);
      if (exists) return state;
      return {
        messages: {
          ...state.messages,
          [conversationId]: [message, ...existingMessages],
        },
      };
    });
  },

  setTyping: (conversationId, userId, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: isTyping ? userId : null,
      },
    }));
  },

  searchUsers: async (query) => {
    try {
      const response = await usersAPI.search(query);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    return [];
  },

  markAsRead: async (conversationId) => {
    try {
      await conversationsAPI.markAsRead(conversationId);
    } catch (_) {}
  },

  clearError: () => set({ error: null }),
}));

export default useChatStore;