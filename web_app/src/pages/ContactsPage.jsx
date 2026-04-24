import { useState, useEffect } from 'react';
import useChatStore from '../store/chatStore';
import { contactsAPI } from '../services/api';

export default function ContactsPage({ onBack }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loadContacts } = useChatStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await loadContacts();
    setContacts(res || []);
    setLoading(false);
  };

  const handleRemoveFriend = async (contactId) => {
    try {
      await contactsAPI.remove(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
    } catch (err) {
      console.error('Remove friend error:', err);
    }
  };

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <button className="contacts-back" onClick={onBack}>
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h2>Liên hệ</h2>
      </div>

      <div className="contacts-list">
        {loading ? (
          <div className="contacts-empty">Đang tải...</div>
        ) : contacts.length === 0 ? (
          <div className="contacts-empty">
            <span className="material-symbols-rounded">people</span>
            <p>Chưa có bạn bè</p>
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} className="contacts-item">
              <div className="contacts-avatar">
                {(contact.display_name || contact.email || 'U')[0].toUpperCase()}
              </div>
              <div className="contacts-info">
                <div className="contacts-name">
                  {contact.display_name || contact.email}
                </div>
                <div className="contacts-status">
                  {contact.online_status === 1 ? 'Online' : 'Offline'}
                </div>
              </div>
              <button 
                className="contacts-remove"
                onClick={() => handleRemoveFriend(contact.id)}
              >
                <span className="material-symbols-rounded">person_remove</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}