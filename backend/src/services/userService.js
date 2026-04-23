const { runQuery, getOne, getAll, getLastInsertRowId, getChanges } = require('../config/database');

class UserService {
  createUser(email, passwordHash, displayName) {
    runQuery(
      'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
      [email, passwordHash, displayName || email.split('@')[0]]
    );
    return this.getUserById(getLastInsertRowId());
  }

  getUserById(id) {
    return getOne(
      'SELECT id, email, display_name, avatar_url, online_status, created_at FROM users WHERE id = ?',
      [id]
    );
  }

  getUserByEmail(email) {
    return getOne('SELECT * FROM users WHERE email = ?', [email]);
  }

  searchUsers(query, excludeUserId) {
    const searchPattern = `%${query}%`;
    return getAll(
      `SELECT id, email, display_name, avatar_url, online_status
       FROM users
       WHERE (email LIKE ? OR display_name LIKE ?)
       AND id != ?
       LIMIT 20`,
      [searchPattern, searchPattern, excludeUserId]
    );
  }

  getAllUsers(excludeUserId) {
    return getAll(
      `SELECT id, email, display_name, avatar_url, online_status
       FROM users
       WHERE id != ?
       ORDER BY online_status DESC, display_name ASC
       LIMIT 50`,
      [excludeUserId]
    );
  }

  updateUserStatus(userId, status) {
    runQuery(
      "UPDATE users SET online_status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, userId]
    );
  }

  updateProfile(userId, data) {
    const fields = [];
    const values = [];
    
    if (data.displayName) {
      fields.push('display_name = ?');
      values.push(data.displayName);
    }
    if (data.avatarUrl) {
      fields.push('avatar_url = ?');
      values.push(data.avatarUrl);
    }
    
    if (fields.length === 0) return null;
    
    values.push(userId);
    runQuery(
      `UPDATE users SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      values
    );
  }
}

module.exports = new UserService();