import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import NotificationsPanel from '../components/common/NotificationsPanel';
import ContactsPage from '../pages/ContactsPage';
import CallsPage from '../pages/CallsPage';
import SettingsPage from '../pages/SettingsPage';
import { socketService } from '../services/socket';
import { contactsAPI } from '../services/api';
import useChatStore from '../store/chatStore';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const { loadMessages, loadConversations, loadContacts } = useChatStore();

  useEffect(() => {
    loadConversations().then(() => setIsLoadingConversations(false));
    
    contactsAPI.getPending().then(res => {
      if (res.data?.success) {
        setNotificationCount(res.data.data.length);
      }
    });

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

    socketService.on('friend_request', (data) => {
      console.log('Received friend_request event:', data);
      setNotificationCount(prev => prev + 1);
    });

    socketService.on('friend_accepted', () => {
      loadConversations();
      loadContacts();
    });

    socketService.on('friend_accept_success', () => {
      setNotificationCount(prev => Math.max(0, prev - 1));
      loadContacts();
    });

    return () => {
      socketService.off('new_message');
      socketService.off('friend_request');
      socketService.off('friend_accepted');
      socketService.off('friend_accept_success');
    };
  }, [selectedConversation, loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      setIsLoadingMessages(true);
      loadMessages(selectedConversation.id).then((msgs) => {
        setMessages(msgs || []);
        setIsLoadingMessages(false);
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

  const renderMainContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationsPanel onClose={() => setActiveTab('chat')} />;
      case 'contacts':
        return <ContactsPage onBack={() => setActiveTab('chat')} />;
      case 'calls':
        return <CallsPage onBack={() => setActiveTab('chat')} />;
      case 'settings':
        return <SettingsPage onBack={() => setActiveTab('chat')} />;
      case 'chat':
      default:
        return (
          <>
            <ChatList 
              onSelectConversation={handleSelectConversation} 
              isLoading={isLoadingConversations}
            />
            <ChatPanel
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingMessages}
            />
          </>
        );
    }
  };

  const isFullWidth = ['notifications', 'contacts', 'calls', 'settings'].includes(activeTab);

  return (
    <div className="home-container">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        notificationCount={notificationCount} 
      />
      
      <div className={isFullWidth ? 'home-main-layout--full' : 'home-main-layout'}>
        {renderMainContent()}
      </div>
    </div>
  );
}