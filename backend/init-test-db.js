const bcrypt = require('bcryptjs');
const fs = require('fs');
const initSqlJs = require('sql.js');

async function initDB() {
  const SQL = await initSqlJs();
  
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
  }
  
  let db;
  if (fs.existsSync('./data/database.sqlite')) {
    const buffer = fs.readFileSync('./data/database.sqlite');
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Drop existing users table to reset passwords
  db.run('DROP TABLE IF EXISTS users');
  
  db.run(`
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
  
  const hash = bcrypt.hashSync('123', 10);
  db.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['usera@test.com', hash, 'User A']);
  db.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['userb@test.com', hash, 'User B']);
  db.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['alice@test.com', hash, 'Alice']);
  db.run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', ['bob@test.com', hash, 'Bob']);
  
  const data = db.export();
  fs.writeFileSync('./data/database.sqlite', Buffer.from(data));
  
  console.log('✅ Database created with password 123');
  db.close();
}

initDB().catch(console.error);