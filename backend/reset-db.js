const initSqlJs = require('sql.js');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function resetDB() {
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
  }
  
  const SQL = await initSqlJs();
  const database = new SQL.Database();
  
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      online_status INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      contact_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, contact_id)
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT DEFAULT 'direct',
      name TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (conversation_id, user_id)
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT,
      message_type TEXT DEFAULT 'text',
      file_url TEXT,
      read_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caller_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      call_type TEXT DEFAULT 'video',
      status TEXT DEFAULT 'missed',
      started_at TEXT,
      ended_at TEXT,
      duration INTEGER
    )
  `);
  
  const hash = bcrypt.hashSync('123', 10);
  database.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['usera@test.com', hash, 'User A']);
  database.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['userb@test.com', hash, 'User B']);
  database.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['alice@test.com', hash, 'Alice']);
  database.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['bob@test.com', hash, 'Bob']);
  
  const data = database.export();
  fs.writeFileSync('./data/database.sqlite', Buffer.from(data));
  
  console.log('✅ Database reset - password 123, no contacts');
  database.close();
}

resetDB().catch(console.error);