import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useChatStore } from '../store/chatStore';

export function useSocket() {
  const { addMessage, setTyping } = useChatStore();

  useEffect(() => {
    socketService.on('new_message', (data) => {
      addMessage(data.message.conversation_id, data.message);
    });

    socketService.on('user_typing', (data) => {
      setTyping(data.conversationId, data.userId, true);
      setTimeout(() => {
        setTyping(data.conversationId, data.userId, false);
      }, 3000);
    });

    socketService.on('user_stop_typing', (data) => {
      setTyping(data.conversationId, data.userId, false);
    });

    return () => {
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('user_stop_typing');
    };
  }, [addMessage, setTyping]);

  return socketService;
}

export function useSocketListener(event, callback) {
  useEffect(() => {
    socketService.on(event, callback);
    return () => socketService.off(event, callback);
  }, [event, callback]);
}