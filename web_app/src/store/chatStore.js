import { create } from 'zustand';
import { conversationsAPI, usersAPI } from '../services/api';
import { socketService } from '../services/socket';

const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: {},
  typingUsers: {},
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

  loadMessages: async (conversationId) => {
    try {
      const response = await conversationsAPI.getMessages(conversationId);
      if (response.data.success) {
        set((state) => ({
          messages: { ...state.messages, [conversationId]: response.data.data },
        }));
      }
    } catch (error) {
      set({ error: 'Failed to load messages' });
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
    if (conversation) {
      socketService.joinConversation(conversation.id);
    }
  },

  getOrCreateConversation: async (participantId) => {
    try {
      const response = await conversationsAPI.getOrCreate(participantId);
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