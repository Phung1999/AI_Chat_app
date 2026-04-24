import { useState, useEffect } from 'react';
import { socketService } from '../../services/socket';
import { contactsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function NotificationsPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await contactsAPI.getPending();
      console.log('Pending requests response:', res.data);
      if (res.data?.success) {
        setNotifications(res.data.data.map(req => ({
          id: req.contact_id,
          type: 'friend_request',
          from: {
            id: req.id,
            display_name: req.display_name,
            email: req.email
          },
          created_at: req.created_at
        })));
      }
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notif) => {
    console.log('Accepting friend request:', notif);
    try {
      const res = await contactsAPI.update(notif.id, 'accepted');
      console.log('Accept API response:', res.data);
      if (res.data?.success) {
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
        socketService.acceptFriend(notif.id, notif.from.id);
      } else {
        console.error('Accept failed:', res.data?.error);
      }
    } catch (err) {
      console.error('Accept error:', err.response?.data || err);
    }
  };

  const handleDecline = async (contactId) => {
    try {
      await contactsAPI.remove(contactId);
      setNotifications(prev => prev.filter(n => n.id !== contactId));
    } catch (err) {
      console.error('Decline error:', err);
    }
  };

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h2>Thông báo</h2>
        {onClose && (
          <button className="notifications-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        )}
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="notifications-empty">Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <span className="material-symbols-rounded">notifications_none</span>
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className="notification-item">
              <div className="notification-avatar">
                {(notif.from.display_name || notif.from.email || 'U')[0].toUpperCase()}
              </div>
              <div className="notification-content">
                <div className="notification-name">
                  {notif.from.display_name || notif.from.email}
                </div>
                <div className="notification-text">
                  Muốn kết bạn với bạn
                </div>
              </div>
              <div className="notification-actions">
                <button 
                  className="notification-accept"
                  onClick={() => handleAccept(notif)}
                >
                  <span className="material-symbols-rounded">check</span>
                </button>
                <button 
                  className="notification-decline"
                  onClick={() => handleDecline(notif.id)}
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}