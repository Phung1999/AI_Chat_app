const { runQuery, getOne, getAll, getLastInsertRowId, getChanges } = require('../config/database');

class ContactService {
  getContacts(userId) {
    return getAll(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.online_status, c.status, c.created_at
       FROM contacts c
       JOIN users u ON c.contact_id = u.id
       WHERE c.user_id = ? AND c.status = 'accepted'
       ORDER BY c.created_at DESC`,
      [userId]
    );
  }

  getPendingContacts(userId) {
    return getAll(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, c.id as contact_id, c.created_at
       FROM contacts c
       JOIN users u ON c.user_id = u.id
       WHERE c.contact_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );
  }

  addContact(userId, contactId) {
    if (userId === contactId) {
      throw new Error('Cannot add yourself as contact');
    }

    const existing = getOne(
      `SELECT * FROM contacts WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)`,
      [userId, contactId, contactId, userId]
    );

    if (existing) {
      throw new Error('Contact already exists');
    }

    runQuery(
      "INSERT INTO contacts (user_id, contact_id, status) VALUES (?, ?, 'pending')",
      [userId, contactId]
    );

    const contact = getOne('SELECT * FROM users WHERE id = ?', [contactId]);
    return { id: getLastInsertRowId(), ...contact, status: 'pending' };
  }

  updateContactStatus(contactId, userId, status) {
    runQuery(
      'UPDATE contacts SET status = ? WHERE id = ? AND contact_id = ?',
      [status, contactId, userId]
    );
    return { changes: getChanges() };
  }

  removeContact(contactId, userId) {
    runQuery(
      `DELETE FROM contacts WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)`,
      [userId, contactId, contactId, userId]
    );
    return { changes: getChanges() };
  }
}

module.exports = new ContactService();