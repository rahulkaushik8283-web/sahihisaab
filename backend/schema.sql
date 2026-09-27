-- SahiHisaab Database Schema for SQLite / Supabase PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gig_category TEXT NOT NULL,
    city TEXT NOT NULL,
    age INTEGER DEFAULT 28,
    monthly_income_band TEXT DEFAULT '15k_25k',
    state TEXT DEFAULT 'Delhi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS income_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    screenshot_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS expense_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS scheme_eligibility (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scheme_code TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    eligible INTEGER NOT NULL DEFAULT 1,
    enrolled INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, scheme_code)
);
