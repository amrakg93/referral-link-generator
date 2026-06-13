const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let db;

function initDb() {
  const dbPath = path.resolve(config.DATABASE_PATH);
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS referrers (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      email TEXT NOT NULL,
      stripe_customer_id TEXT,
      reward_balance INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS referral_links (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      referrer_id TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      link_url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (referrer_id) REFERENCES referrers(id)
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id TEXT PRIMARY KEY,
      link_id TEXT NOT NULL,
      referred_email TEXT,
      stripe_coupon_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (link_id) REFERENCES referral_links(id)
    );
  `);

  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

module.exports = { initDb, getDb };
