-- Emergency Home Services Auto-Dispatch System SQLite Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('customer', 'technician', 'admin')) NOT NULL DEFAULT 'customer',
  phone TEXT,
  avatar TEXT,
  address TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technicians (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  is_online INTEGER NOT NULL DEFAULT 1,
  is_busy INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 4.8,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  vehicle_type TEXT DEFAULT 'Van',
  current_request_id TEXT,
  response_time_avg REAL DEFAULT 14.5,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  technician_id TEXT,
  category TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('Critical', 'High', 'Medium')) NOT NULL DEFAULT 'High',
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  status TEXT CHECK(status IN ('REQUESTED', 'AUTO_DISPATCHED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) NOT NULL DEFAULT 'REQUESTED',
  eta_minutes INTEGER DEFAULT 15,
  distance_km REAL DEFAULT 3.2,
  rating INTEGER,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

CREATE TABLE IF NOT EXISTS status_logs (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS otp_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  channel TEXT NOT NULL,
  destination TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  cooldown_until INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

