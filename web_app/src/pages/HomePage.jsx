import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import { socketService } from '../services/socket';
import useChatStore from '../store/chatStore';
import { COLORS } from '../services/constants';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const { loadMessages, addMessage, loadConversations } = useChatStore();

  useEffect(() => {
    loadConversations();

    socketService.on('new_message', (data) => {
      const { message, conversationId } = data.message;
      if (selectedConversation?.id === conversationId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
        socketService.emit('mark_read', { conversationId });
      }
      loadConversations();
    });

    return () => {
      socketService.off('new_message');
    };
  }, [selectedConversation, loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id).then((msgs) => {
        setMessages(msgs || []);
        socketService.joinConversation(selectedConversation.id);
      });
      return () => {
        socketService.leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation]);

  const handleSendMessage = (content) => {
    if (!selectedConversation) return;
    socketService.sendMessage(selectedConversation.id, content);
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
  };

  return (
    <div style={styles.container}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div style={styles.mainLayout}>
        <ChatList onSelectConversation={handleSelectConversation} />
        
        <ChatPanel
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
  },
};