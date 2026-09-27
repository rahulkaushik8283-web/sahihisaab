import os
import shutil
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).parent
ORIGINAL_DB_PATH = BASE_DIR / "sahihisaab.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"

# Detect Vercel serverless environment
IS_VERCEL = os.environ.get("VERCEL") == "1" or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None

if IS_VERCEL:
    DB_PATH = Path("/tmp/sahihisaab.db")
else:
    DB_PATH = ORIGINAL_DB_PATH

def ensure_serverless_db():
    if IS_VERCEL and not DB_PATH.exists():
        if ORIGINAL_DB_PATH.exists():
            try:
                shutil.copy2(ORIGINAL_DB_PATH, DB_PATH)
                print("[SahiHisaab DB] Copied seeded database to /tmp/sahihisaab.db for Vercel serverless execution.")
            except Exception as e:
                print("[SahiHisaab DB] Copy DB to /tmp failed:", e)

def get_db_connection():
    ensure_serverless_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    ensure_serverless_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if SCHEMA_PATH.exists():
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()
            cursor.executescript(schema_sql)
            
    conn.commit()
    conn.close()
    print("[SahiHisaab DB] Database initialized successfully at:", DB_PATH)

if __name__ == "__main__":
    init_db()
