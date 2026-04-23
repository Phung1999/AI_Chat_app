const { runQuery, getOne, getAll, getLastInsertRowId, getChanges } = require('../config/database');

class CallService {
  createCallLog(callerId, receiverId, callType) {
    runQuery(
      `INSERT INTO call_logs (caller_id, receiver_id, call_type, status, started_at)
       VALUES (?, ?, ?, 'calling', datetime('now'))`,
      [callerId, receiverId, callType]
    );
    return this.getCallLogById(getLastInsertRowId());
  }

  getCallLogById(callId) {
    return getOne(
      `SELECT cl.*,
        c.email as caller_email, c.display_name as caller_name,
        r.email as receiver_email, r.display_name as receiver_name
       FROM call_logs cl
       JOIN users c ON cl.caller_id = c.id
       JOIN users r ON cl.receiver_id = r.id
       WHERE cl.id = ?`,
      [callId]
    );
  }

  updateCallStatus(callId, status) {
    let endedAt = null;
    let duration = null;

    if (status === 'ended' || status === 'declined' || status === 'missed') {
      const callLog = this.getCallLogById(callId);
      if (callLog && callLog.started_at) {
        endedAt = new Date().toISOString();
        duration = Math.floor((new Date(endedAt) - new Date(callLog.started_at)) / 1000);
      }
    }

    runQuery(
      'UPDATE call_logs SET status = ?, ended_at = ?, duration = ? WHERE id = ?',
      [status, endedAt, duration, callId]
    );
  }

  getCallHistory(userId, limit = 20) {
    return getAll(
      `SELECT cl.*,
        c.email as caller_email, c.display_name as caller_name, c.avatar_url as caller_avatar,
        r.email as receiver_email, r.display_name as receiver_name, r.avatar_url as receiver_avatar
       FROM call_logs cl
       JOIN users c ON cl.caller_id = c.id
       JOIN users r ON cl.receiver_id = r.id
       WHERE cl.caller_id = ? OR cl.receiver_id = ?
       ORDER BY cl.started_at DESC
       LIMIT ?`,
      [userId, userId, limit]
    );
  }
}

module.exports = new CallService();