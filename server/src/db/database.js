import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, "../../dispatch.db");
const SCHEMA_PATH = path.resolve(__dirname, "schema.sql");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error opening SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database at:", DB_PATH);
  }
});

// Promisified database helpers
export const query = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};

export async function initDb() {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  await query.exec(schema);

  // Safe table column upgrades for service_requests
  const columnsToAdd = [
    { col: "service_name", type: "TEXT" },
    { col: "service_slug", type: "TEXT" },
    { col: "service_image", type: "TEXT" },
    { col: "scheduled_date", type: "TEXT" },
    { col: "scheduled_time", type: "TEXT" },
    { col: "price", type: "TEXT" },
    { col: "total_paid", type: "TEXT" },
    { col: "payment_method", type: "TEXT" },
  ];

  for (const { col, type } of columnsToAdd) {
    try {
      await query.run(`ALTER TABLE service_requests ADD COLUMN ${col} ${type}`);
    } catch {
      // Column already exists
    }
  }

  try {
    await query.run(`ALTER TABLE status_logs ADD COLUMN note TEXT`);
  } catch {
    // Column already exists
  }

  const techColumnsToAdd = [
    { col: "status", type: "TEXT DEFAULT 'Approved'" },
    { col: "skills", type: "TEXT" },
    { col: "experience_years", type: "INTEGER DEFAULT 1" },
    { col: "experience_description", type: "TEXT" },
    { col: "id_document_type", type: "TEXT" },
    { col: "id_document_url", type: "TEXT" },
    { col: "verification_notes", type: "TEXT" },
    { col: "account_type", type: "TEXT DEFAULT 'individual'" },
    { col: "company_name", type: "TEXT" },
    { col: "authorized_person", type: "TEXT" },
    { col: "business_registration_number", type: "TEXT" },
    { col: "service_areas", type: "TEXT DEFAULT 'Delhi NCR'" },
    { col: "bank_holder_name", type: "TEXT" },
    { col: "bank_name", type: "TEXT" },
    { col: "bank_account_number", type: "TEXT" },
    { col: "bank_ifsc", type: "TEXT" },
    { col: "bank_verification_status", type: "TEXT DEFAULT 'Not Connected'" },
    { col: "payout_status", type: "TEXT DEFAULT 'Active'" },
  ];

  for (const { col, type } of techColumnsToAdd) {
    try {
      await query.run(`ALTER TABLE technicians ADD COLUMN ${col} ${type}`);
    } catch {
      // Column already exists
    }
  }

  // Create user_cart, user_notifications and technician_payouts tables if not present
  try {
    await query.exec(`
      CREATE TABLE IF NOT EXISTS user_cart (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT DEFAULT 'booking',
        unread INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS technician_payouts (
        id TEXT PRIMARY KEY,
        technician_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'Completed',
        bank_account_tail TEXT,
        reference_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE
      );
    `);
  } catch (err) {
    console.error("Error creating tables:", err);
  }

  console.log("Database tables verified / initialized successfully.");
}

export default db;
