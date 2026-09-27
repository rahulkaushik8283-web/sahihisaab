import sys
import os

# Add backend directory to sys.path for serverless imports
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app
from db import ensure_serverless_db

# Ensure seeded DB is available in Vercel /tmp folder
ensure_serverless_db()

# Export Flask app for Vercel Serverless Function
handler = app
