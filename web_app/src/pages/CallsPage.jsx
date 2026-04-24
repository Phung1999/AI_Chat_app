import { useState, useEffect } from 'react';
import { callsAPI } from '../services/api';

export default function CallsPage({ onBack }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      const res = await callsAPI.getHistory();
      if (res.data?.success) {
        setCalls(res.data.data || []);
      }
    } catch (err) {
      console.error('Load calls error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric', 
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="calls-page">
      <div className="calls-header">
        <button className="calls-back" onClick={onBack}>
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h2>Lịch sử cuộc gọi</h2>
      </div>

      <div className="calls-list">
        {loading ? (
          <div className="calls-empty">Đang tải...</div>
        ) : calls.length === 0 ? (
          <div className="calls-empty">
            <span className="material-symbols-rounded">call</span>
            <p>Chưa có cuộc gọi nào</p>
          </div>
        ) : (
          calls.map(call => (
            <div key={call.id} className="calls-item">
              <div className="calls-avatar">
                <span className="material-symbols-rounded">
                  {call.call_type === 'video' ? 'videocam' : 'call'}
                </span>
              </div>
              <div className="calls-info">
                <div className="calls-name">
                  {call.caller_id === call.my_id ? call.callee_name : call.caller_name}
                </div>
                <div className="calls-time">
                  {call.call_type === 'video' ? 'Video call' : 'Voice call'} • {formatTime(call.created_at)}
                </div>
              </div>
              <div className={`calls-status calls-status--${call.status}`}>
                {call.status === 'accepted' ? 'Đã nghe' : call.status === 'declined' ? 'Từ chối' : 'Missed'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}