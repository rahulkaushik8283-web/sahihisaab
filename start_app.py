import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 60)
    print(" 🚀 Starting SahiHisaab - Financial Clarity Dashboard")
    print("=" * 60)

    # 1. Initialize and Seed DB
    print("\n[1/3] Initializing SQLite database & seeding pilot demo data...")
    seed_proc = subprocess.run([sys.executable, "seed_data.py"], cwd=BACKEND_DIR)
    if seed_proc.returncode != 0:
        print("⚠️ Warning: Seed script finished with non-zero exit code.")

    # 2. Start Flask Backend
    print("\n[2/3] Starting Flask REST API server on http://localhost:5000...")
    backend_proc = subprocess.Popen([sys.executable, "app.py"], cwd=BACKEND_DIR)

    time.sleep(2)

    # 3. Start Vite Frontend Server
    print("\n[3/3] Starting React Vite frontend server on http://localhost:5173...")
    frontend_cmd = "cmd /c npm run dev" if os.name == "nt" else "npm run dev"
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR, shell=True)

    time.sleep(3)

    print("\n" + "=" * 60)
    print(" ✅ SahiHisaab is up and running!")
    print(" 🌐 App URL: http://localhost:5173")
    print(" ⚙️ API URL: http://localhost:5000/api/health")
    print("=" * 60 + "\n")

    try:
        webbrowser.open("http://localhost:5173")
    except Exception as e:
        print("Could not auto-open browser:", e)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping SahiHisaab servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
