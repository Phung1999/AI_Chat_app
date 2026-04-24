const { runQuery, getOne, getAll, getLastInsertRowId, getChanges } = require('../config/database');
const userService = require('./userService');

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

  addContactByEmail(userId, email) {
    const targetUser = userService.getUserByEmail(email);
    if (!targetUser) {
      throw new Error('User not found');
    }
    return this.addContact(userId, targetUser.id);
  }

  addContact(userId, contactId) {
    console.log('[addContact] userId:', userId, 'contactId:', contactId, 'types:', typeof userId, typeof contactId);
    if (userId === contactId) {
      throw new Error('Cannot add yourself as contact');
    }

    const existing = getOne(
      `SELECT * FROM contacts WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)`,
      [userId, contactId, contactId, userId]
    );
    console.log('[addContact] existing:', existing);

    if (existing) {
      if (existing.status === 'accepted') {
        throw new Error('Contact already exists');
      }
      if (existing.status === 'pending') {
        throw new Error('Friend request already sent');
      }
      if (existing.status === 'declined' || existing.status === 'rejected') {
        runQuery(
          "UPDATE contacts SET status = 'pending', created_at = datetime('now') WHERE id = ?",
          [existing.id]
        );
        const contact = getOne('SELECT * FROM users WHERE id = ?', [contactId]);
        return { id: existing.id, ...contact, status: 'pending' };
      }
    }

    runQuery(
      "INSERT INTO contacts (user_id, contact_id, status) VALUES (?, ?, 'pending')",
      [userId, contactId]
    );

    const contact = getOne('SELECT * FROM users WHERE id = ?', [contactId]);
    console.log('[addContact] Created new contact, id:', getLastInsertRowId());
    return { id: getLastInsertRowId(), ...contact, status: 'pending' };
  }

  updateContactStatus(contactId, userId, status) {
    console.log('[updateContactStatus] contactId:', contactId, 'userId:', userId, 'status:', status);
    
    // Find the contact record
    const contact = getOne('SELECT * FROM contacts WHERE id = ?', [contactId]);
    console.log('[updateContactStatus] Found contact:', contact);
    
    if (!contact) {
      return { changes: 0 };
    }
    
    // Update the original request
    runQuery(
      'UPDATE contacts SET status = ? WHERE id = ?',
      [status, contactId]
    );
    
    // If accepted, create reverse relationship
    if (status === 'accepted') {
      const existingReverse = getOne(
        'SELECT * FROM contacts WHERE user_id = ? AND contact_id = ?',
        [userId, contact.user_id]
      );
      
      if (!existingReverse) {
        runQuery(
          "INSERT INTO contacts (user_id, contact_id, status) VALUES (?, ?, 'accepted')",
          [userId, contact.user_id]
        );
        console.log('[updateContactStatus] Created reverse relationship');
      }
    }
    
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