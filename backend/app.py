import os
import uuid
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from db import get_db_connection, init_db
from seed_data import seed_database
from ocr_engine import parse_earnings_screenshot

frontend_public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public"))

app = Flask(__name__, static_folder=frontend_public_dir, static_url_path="")
CORS(app)

# Ensure DB is created and seeded on startup
init_db()
seed_database()

def dict_from_row(row):
    return dict(row) if row else None

def get_current_user_id():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        if token.startswith("user_"):
            return token
    return "user_demo_rahul_123"

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "app": "SahiHisaab API", "timestamp": datetime.now().isoformat()})

# ---------------------------------------------------------------------------
# AUTH & PROFILE ENDPOINTS (Mock OTP Login)
# ---------------------------------------------------------------------------
@app.route("/api/auth/send-otp", methods=["POST"])
def send_otp():
    data = request.json or {}
    phone = data.get("phone", "").strip()
    if not phone or len(phone) < 10:
        return jsonify({"error": "Please enter a valid 10-digit phone number"}), 400
        
    return jsonify({
        "success": True,
        "message": f"OTP sent successfully to +91 {phone}",
        "mock_otp": "123456",
        "phone": phone
    })

@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json or {}
    phone = data.get("phone", "").strip()
    otp = data.get("otp", "").strip()
    
    if otp != "123456" and otp != "999999":
        return jsonify({"error": "Invalid OTP. Use 123456 for instant demo login."}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
    user = cursor.fetchone()
    
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:10]}"
        name = data.get("name", "Gig Partner")
        gig_category = data.get("gig_category", "Delivery Partner")
        city = data.get("city", "Delhi NCR")
        
        cursor.execute(
            """INSERT INTO users (id, phone, name, gig_category, city, age, monthly_income_band, state)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, phone, name, gig_category, city, 26, "25k_35k", "Delhi")
        )
        conn.commit()
        
        default_schemes = [
            ("eshram", "e-Shram (National Database of Unorganized Workers)", 1, 0),
            ("pmsym", "Pradhan Mantri Shram Yogi Maandhan (PM-SYM)", 1, 0),
            ("pmjjby", "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)", 1, 0),
            ("pmsby", "Pradhan Mantri Suraksha Bima Yojana (PMSBY)", 1, 0),
        ]
        for code, sname, el, en in default_schemes:
            cursor.execute(
                """INSERT INTO scheme_eligibility (id, user_id, scheme_code, scheme_name, eligible, enrolled)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (f"sch_{uuid.uuid4().hex[:10]}", user_id, code, sname, el, en)
            )
        conn.commit()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
    conn.close()
    
    user_dict = dict_from_row(user)
    return jsonify({
        "success": True,
        "token": user_dict["id"],
        "user": user_dict
    })

@app.route("/api/user/profile", methods=["GET", "PUT"])
def user_profile():
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == "GET":
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": dict_from_row(user)})
        
    elif request.method == "PUT":
        data = request.json or {}
        name = data.get("name")
        gig_category = data.get("gig_category")
        city = data.get("city")
        age = data.get("age")
        monthly_income_band = data.get("monthly_income_band")
        state = data.get("state")
        
        cursor.execute(
            """UPDATE users SET
               name = COALESCE(?, name),
               gig_category = COALESCE(?, gig_category),
               city = COALESCE(?, city),
               age = COALESCE(?, age),
               monthly_income_band = COALESCE(?, monthly_income_band),
               state = COALESCE(?, state)
               WHERE id = ?""",
            (name, gig_category, city, age, monthly_income_band, state, user_id)
        )
        conn.commit()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        updated_user = cursor.fetchone()
        conn.close()
        return jsonify({"success": True, "user": dict_from_row(updated_user)})

# ---------------------------------------------------------------------------
# INCOME & EXPENSE ENDPOINTS
# ---------------------------------------------------------------------------
@app.route("/api/income", methods=["GET", "POST"])
def manage_income():
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == "GET":
        cursor.execute("SELECT * FROM income_entries WHERE user_id = ? ORDER BY date DESC, created_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return jsonify({"income": [dict_from_row(r) for r in rows]})
        
    elif request.method == "POST":
        data = request.json or {}
        platform = data.get("platform", "").strip()
        amount = float(data.get("amount", 0))
        date = data.get("date", datetime.now().strftime("%Y-%m-%d"))
        source = data.get("source", "manual")
        notes = data.get("notes", "")
        
        if not platform or amount <= 0:
            return jsonify({"error": "Please provide a valid platform and positive amount"}), 400
            
        entry_id = f"inc_{uuid.uuid4().hex[:10]}"
        cursor.execute(
            """INSERT INTO income_entries (id, user_id, platform, amount, date, source, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (entry_id, user_id, platform, amount, date, source, notes)
        )
        conn.commit()
        cursor.execute("SELECT * FROM income_entries WHERE id = ?", (entry_id,))
        new_entry = cursor.fetchone()
        conn.close()
        return jsonify({"success": True, "entry": dict_from_row(new_entry)})

@app.route("/api/income/<entry_id>", methods=["DELETE"])
def delete_income(entry_id):
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM income_entries WHERE id = ? AND user_id = ?", (entry_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Income entry deleted"})

@app.route("/api/expenses", methods=["GET", "POST"])
def manage_expenses():
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == "GET":
        cursor.execute("SELECT * FROM expense_entries WHERE user_id = ? ORDER BY date DESC, created_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return jsonify({"expenses": [dict_from_row(r) for r in rows]})
        
    elif request.method == "POST":
        data = request.json or {}
        category = data.get("category", "").strip()
        amount = float(data.get("amount", 0))
        date = data.get("date", datetime.now().strftime("%Y-%m-%d"))
        description = data.get("description", "")
        
        if not category or amount <= 0:
            return jsonify({"error": "Please select a valid expense category and positive amount"}), 400
            
        entry_id = f"exp_{uuid.uuid4().hex[:10]}"
        cursor.execute(
            """INSERT INTO expense_entries (id, user_id, category, amount, date, description)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (entry_id, user_id, category, amount, date, description)
        )
        conn.commit()
        cursor.execute("SELECT * FROM expense_entries WHERE id = ?", (entry_id,))
        new_entry = cursor.fetchone()
        conn.close()
        return jsonify({"success": True, "entry": dict_from_row(new_entry)})

@app.route("/api/expenses/<entry_id>", methods=["DELETE"])
def delete_expense(entry_id):
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expense_entries WHERE id = ? AND user_id = ?", (entry_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Expense entry deleted"})

# ---------------------------------------------------------------------------
# OCR PARSER ENDPOINT FOR SCREENSHOT UPLOADS
# ---------------------------------------------------------------------------
@app.route("/api/ocr/parse", methods=["POST"])
def parse_ocr():
    file = request.files.get("file")
    filename = file.filename if file else "earnings_screenshot.png"
    result = parse_earnings_screenshot(file_stream_or_bytes=file, filename=filename)
    return jsonify(result)

# ---------------------------------------------------------------------------
# DASHBOARD STATS & TRENDS ENDPOINT
# ---------------------------------------------------------------------------
@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    user_id = get_current_user_id()
    timeframe = request.args.get("timeframe", "this_month")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.now()
    if timeframe == "this_month":
        start_date = now.replace(day=1).strftime("%Y-%m-%d")
    elif timeframe == "last_30_days":
        start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
    else:
        start_date = "2000-01-01"
        
    cursor.execute("SELECT SUM(amount) as total FROM income_entries WHERE user_id = ? AND date >= ?", (user_id, start_date))
    gross_row = cursor.fetchone()
    total_gross = gross_row["total"] if gross_row and gross_row["total"] else 0.0
    
    cursor.execute("SELECT SUM(amount) as total FROM expense_entries WHERE user_id = ? AND date >= ?", (user_id, start_date))
    exp_row = cursor.fetchone()
    total_expenses = exp_row["total"] if exp_row and exp_row["total"] else 0.0
    
    net_income = total_gross - total_expenses
    
    cursor.execute(
        """SELECT category, SUM(amount) as cat_total
           FROM expense_entries
           WHERE user_id = ? AND date >= ?
           GROUP BY category
           ORDER BY cat_total DESC""",
        (user_id, start_date)
    )
    exp_breakdown_rows = cursor.fetchall()
    expense_breakdown = []
    for r in exp_breakdown_rows:
        pct = round((r["cat_total"] / total_expenses * 100), 1) if total_expenses > 0 else 0
        expense_breakdown.append({
            "category": r["category"],
            "amount": r["cat_total"],
            "percentage": pct
        })
        
    cursor.execute(
        """SELECT platform, SUM(amount) as plat_total
           FROM income_entries
           WHERE user_id = ? AND date >= ?
           GROUP BY platform
           ORDER BY plat_total DESC""",
        (user_id, start_date)
    )
    plat_rows = cursor.fetchall()
    income_by_platform = [{"platform": r["platform"], "amount": r["plat_total"]} for r in plat_rows]

    trend_data = []
    for i in range(5, -1, -1):
        month_target = (now.replace(day=1) - timedelta(days=i*28)).replace(day=1)
        month_str = month_target.strftime("%b %Y")
        
        if month_target.month == 12:
            next_month = month_target.replace(year=month_target.year+1, month=1, day=1)
        else:
            next_month = month_target.replace(month=month_target.month+1, day=1)
            
        m_start = month_target.strftime("%Y-%m-%d")
        m_end = next_month.strftime("%Y-%m-%d")
        
        cursor.execute("SELECT SUM(amount) as inc FROM income_entries WHERE user_id = ? AND date >= ? AND date < ?", (user_id, m_start, m_end))
        m_inc_row = cursor.fetchone()
        m_inc = m_inc_row["inc"] if m_inc_row and m_inc_row["inc"] else 0.0
        
        cursor.execute("SELECT SUM(amount) as exp FROM expense_entries WHERE user_id = ? AND date >= ? AND date < ?", (user_id, m_start, m_end))
        m_exp_row = cursor.fetchone()
        m_exp = m_exp_row["exp"] if m_exp_row and m_exp_row["exp"] else 0.0
        
        m_net = m_inc - m_exp
        trend_data.append({
            "month": month_str,
            "gross": round(m_inc, 2),
            "expenses": round(m_exp, 2),
            "net": round(m_net, 2)
        })

    cursor.execute("SELECT id, 'income' as type, platform as title, amount, date, source as detail FROM income_entries WHERE user_id = ? UNION SELECT id, 'expense' as type, category as title, amount, date, description as detail FROM expense_entries WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 10", (user_id, user_id))
    recent_txs = [dict_from_row(r) for r in cursor.fetchall()]

    conn.close()
    
    return jsonify({
        "timeframe": timeframe,
        "total_gross": round(total_gross, 2),
        "total_expenses": round(total_expenses, 2),
        "net_income": round(net_income, 2),
        "expense_breakdown": expense_breakdown,
        "income_by_platform": income_by_platform,
        "trend_data": trend_data,
        "recent_transactions": recent_txs
    })

# ---------------------------------------------------------------------------
# SCHEME ELIGIBILITY CHECKER ENDPOINT
# ---------------------------------------------------------------------------
SCHEMES_CATALOG = [
    {
        "code": "eshram",
        "name": "e-Shram Portal",
        "title_hi": "ई-श्रम पोर्टल (असंगठित श्रमिक कार्ड)",
        "benefit": "Social security benefits, ₹2 Lakh accidental insurance & direct govt aid during distress.",
        "benefit_hi": "सामाजिक सुरक्षा लाभ, ₹2 लाख का दुर्घटना बीमा और संकट के दौरान सीधी सरकारी सहायता।",
        "min_age": 16,
        "max_age": 59,
        "max_income_band": "all",
        "category": "All Gig Workers",
        "official_url": "https://eshram.gov.in/",
        "steps": [
            "Keep your Aadhaar number & Aadhaar-linked Mobile number ready.",
            "Visit eshram.gov.in and click on 'Register on e-Shram'.",
            "Enter Aadhaar number and submit OTP sent to your phone.",
            "Fill in occupation details as 'Gig Worker / Delivery Partner / Driver'.",
            "Download your 12-digit UAN e-Shram card instantly."
        ]
    },
    {
        "code": "pmsym",
        "name": "PM Shram Yogi Maandhan (PM-SYM)",
        "title_hi": "प्रधानमंत्री श्रम योगी मानधन (PM-SYM)",
        "benefit": "Guaranteed ₹3,000 monthly pension after age 60 with 50% govt matching contribution.",
        "benefit_hi": "60 वर्ष की आयु के बाद 50% सरकारी मिलान अंशदान के साथ गारंटीकृत ₹3,000 मासिक पेंशन।",
        "min_age": 18,
        "max_age": 40,
        "max_income_band": "below_15k",
        "category": "Unorganized Sector",
        "official_url": "https://maandhan.in/",
        "steps": [
            "Visit nearest Common Service Center (CSC) or maandhan.in.",
            "Provide Aadhaar card and Savings Bank account / Jan Dhan account details.",
            "Initial monthly contribution (₹55 - ₹200 based on age) auto-debited.",
            "Central Govt matches equal monthly amount into pension account."
        ]
    },
    {
        "code": "pmjjby",
        "name": "PM Jeevan Jyoti Bima Yojana (PMJJBY)",
        "title_hi": "प्रधानमंत्री जीवन ज्योति बीमा योजना (PMJJBY)",
        "benefit": "₹2 Lakh life insurance cover for any cause of death at low premium of ₹436/year.",
        "benefit_hi": "₹436/वर्ष के कम प्रीमियम पर किसी भी कारण से मृत्यु होने पर ₹2 लाख का जीवन बीमा कवर।",
        "min_age": 18,
        "max_age": 50,
        "max_income_band": "all",
        "category": "Life Insurance",
        "official_url": "https://www.financialservices.gov.in/insurance-divisions/Government-Sponsored-Social-Security-Schemes/Pradhan-Mantri-Jeevan-Jyoti-Bima-Yojana(PMJJBY)",
        "steps": [
            "Log in to your Mobile Banking app or visit your bank branch.",
            "Search for PMJJBY Social Security scheme section.",
            "Select auto-debit option for ₹436 annual premium from your savings account.",
            "Instant policy confirmation certificate downloaded."
        ]
    },
    {
        "code": "pmsby",
        "name": "PM Suraksha Bima Yojana (PMSBY)",
        "title_hi": "प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY)",
        "benefit": "₹2 Lakh accidental death / total disability insurance at just ₹20/year.",
        "benefit_hi": "केवल ₹20/वर्ष में ₹2 लाख का दुर्घटना मृत्यु / पूर्ण विकलांगता बीमा।",
        "min_age": 18,
        "max_age": 70,
        "max_income_band": "all",
        "category": "Accident Insurance",
        "official_url": "https://www.financialservices.gov.in/insurance-divisions/Government-Sponsored-Social-Security-Schemes/Pradhan-Mantri-Suraksha-Bima-Yojana(PMSBY)",
        "steps": [
            "Visit your savings bank branch or open internet banking.",
            "Select PMSBY scheme under insurance category.",
            "Enable annual ₹20 auto-debit on 31st May every year.",
            "Cover activates immediately for accidental risk protection."
        ]
    }
]

@app.route("/api/schemes/check", methods=["GET", "POST"])
def check_schemes():
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == "POST":
        data = request.json or {}
        age = int(data.get("age", 26))
        income_band = data.get("monthly_income_band", "15k_25k")
        state = data.get("state", "Delhi")
        gig_category = data.get("gig_category", "Delivery Partner")
        
        cursor.execute(
            """UPDATE users SET age = ?, monthly_income_band = ?, state = ?, gig_category = ? WHERE id = ?""",
            (age, income_band, state, gig_category, user_id)
        )
        conn.commit()
    else:
        cursor.execute("SELECT age, monthly_income_band, state, gig_category FROM users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        if u:
            age = u["age"] or 26
            income_band = u["monthly_income_band"] or "15k_25k"
            state = u["state"] or "Delhi"
            gig_category = u["gig_category"] or "Delivery Partner"
        else:
            age, income_band, state, gig_category = 26, "15k_25k", "Delhi", "Delivery Partner"

    cursor.execute("SELECT scheme_code, enrolled FROM scheme_eligibility WHERE user_id = ?", (user_id,))
    enrolled_map = {row["scheme_code"]: bool(row["enrolled"]) for row in cursor.fetchall()}

    results = []
    for sc in SCHEMES_CATALOG:
        code = sc["code"]
        is_eligible = True
        reason = "Meets all criteria"
        
        if age < sc["min_age"] or age > sc["max_age"]:
            is_eligible = False
            reason = f"Age must be between {sc['min_age']} and {sc['max_age']} years (Your age: {age})"
            
        if sc["max_income_band"] == "below_15k" and income_band != "below_15k":
            is_eligible = False
            reason = "Monthly income must be below ₹15,000 for PM-SYM pension eligibility"
            
        is_enrolled = enrolled_map.get(code, False)
        
        cursor.execute(
            """INSERT INTO scheme_eligibility (id, user_id, scheme_code, scheme_name, eligible, enrolled)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id, scheme_code) DO UPDATE SET eligible = ?, updated_at = CURRENT_TIMESTAMP""",
            (f"sch_{uuid.uuid4().hex[:10]}", user_id, code, sc["name"], int(is_eligible), int(is_enrolled), int(is_eligible))
        )
        
        results.append({
            "code": code,
            "name": sc["name"],
            "title_hi": sc["title_hi"],
            "benefit": sc["benefit"],
            "benefit_hi": sc["benefit_hi"],
            "category": sc["category"],
            "official_url": sc["official_url"],
            "steps": sc["steps"],
            "eligible": is_eligible,
            "enrolled": is_enrolled,
            "reason": reason
        })

    conn.commit()
    conn.close()
    
    return jsonify({
        "user_profile": {"age": age, "monthly_income_band": income_band, "state": state, "gig_category": gig_category},
        "schemes": results
    })

@app.route("/api/schemes/toggle-enroll", methods=["POST"])
def toggle_scheme_enrollment():
    user_id = get_current_user_id()
    data = request.json or {}
    scheme_code = data.get("scheme_code")
    enrolled_state = data.get("enrolled", True)
    
    if not scheme_code:
        return jsonify({"error": "scheme_code required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE scheme_eligibility SET enrolled = ? WHERE user_id = ? AND scheme_code = ?""",
        (int(enrolled_state), user_id, scheme_code)
    )
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "scheme_code": scheme_code, "enrolled": enrolled_state})

# ---------------------------------------------------------------------------
# CREDIT-READINESS SCORE ENDPOINT
# ---------------------------------------------------------------------------
@app.route("/api/credit-score", methods=["GET"])
def get_credit_score():
    user_id = get_current_user_id()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    cursor.execute("SELECT COUNT(*) as count FROM income_entries WHERE user_id = ? AND date >= ?", (user_id, thirty_days_ago))
    inc_count = cursor.fetchone()["count"]
    
    if inc_count >= 10:
        logging_score = 35
        logging_status = "Excellent regularity (10+ entries/month)"
    elif inc_count >= 5:
        logging_score = 25
        logging_status = "Good regularity (5-9 entries/month)"
    elif inc_count >= 1:
        logging_score = 15
        logging_status = "Moderate regularity (1-4 entries/month)"
    else:
        logging_score = 5
        logging_status = "Needs improvement (0 entries logged in 30 days)"

    now = datetime.now()
    monthly_nets = []
    for i in range(5, -1, -1):
        m_start = (now.replace(day=1) - timedelta(days=i*28)).replace(day=1).strftime("%Y-%m-%d")
        m_end = (now.replace(day=1) - timedelta(days=(i-1)*28)).replace(day=1).strftime("%Y-%m-%d") if i > 0 else (now + timedelta(days=1)).strftime("%Y-%m-%d")
        
        cursor.execute("SELECT SUM(amount) as inc FROM income_entries WHERE user_id = ? AND date >= ? AND date < ?", (user_id, m_start, m_end))
        inc_val = cursor.fetchone()["inc"] or 0.0
        
        cursor.execute("SELECT SUM(amount) as exp FROM expense_entries WHERE user_id = ? AND date >= ? AND date < ?", (user_id, m_start, m_end))
        exp_val = cursor.fetchone()["exp"] or 0.0
        
        monthly_nets.append(max(0, inc_val - exp_val))
        
    avg_net = sum(monthly_nets) / len(monthly_nets) if monthly_nets else 0
    positive_months = sum(1 for n in monthly_nets if n > 0)
    
    if avg_net > 15000 and positive_months >= 5:
        stability_score = 40
        stability_status = f"Strong net positive income (Avg ₹{int(avg_net):,}/mo)"
    elif avg_net > 8000 and positive_months >= 3:
        stability_score = 28
        stability_status = f"Stable net positive income (Avg ₹{int(avg_net):,}/mo)"
    elif avg_net > 0:
        stability_score = 18
        stability_status = f"Positive cash flow with variation (Avg ₹{int(avg_net):,}/mo)"
    else:
        stability_score = 5
        stability_status = "Expenses exceed earnings"

    cursor.execute("SELECT COUNT(*) as cnt FROM scheme_eligibility WHERE user_id = ? AND enrolled = 1", (user_id,))
    enrolled_cnt = cursor.fetchone()["cnt"]
    
    scheme_score = min(25, enrolled_cnt * 9)
    scheme_status = f"{enrolled_cnt} Govt scheme(s) enrolled"

    total_score = logging_score + stability_score + scheme_score
    total_score = min(100, max(0, total_score))
    
    if total_score >= 80:
        tier = "Prime Credit-Ready"
        tier_hi = "उत्कृष्ट क्रेडिट तत्परता"
        color = "#16A085"
        headline_summary = "High loan approval odds from micro-lending partners & lower interest rates."
    elif total_score >= 60:
        tier = "Good Credit-Ready"
        tier_hi = "अच्छी क्रेडिट तत्परता"
        color = "#2E86DE"
        headline_summary = "Solid financial discipline. Enrolling in 1 more scheme will unlock Tier-1 loans."
    elif total_score >= 40:
        tier = "Fair Credit-Ready"
        tier_hi = "सामान्य स्थिति"
        color = "#F39C12"
        headline_summary = "Regularly log weekly earnings and fuel expenses to build loan eligibility."
    else:
        tier = "Building Foundation"
        tier_hi = "बुनियादी स्तर"
        color = "#D81B60"
        headline_summary = "Start logging earnings daily to establish a verified financial track record."

    conn.close()

    tips = []
    if inc_count < 8:
        tips.append({
            "title": "Log Earnings 2x Weekly",
            "impact": "+15 points",
            "desc": "Upload screenshots or add daily Swiggy/Zomato/Uber earnings to prove cash flow consistency."
        })
    if enrolled_cnt < 3:
        tips.append({
            "title": "Enroll in e-Shram & PMSBY",
            "impact": "+18 points",
            "desc": "Government insurance coverage improves risk profile for digital micro-loans."
        })
    if avg_net < 15000:
        tips.append({
            "title": "Track Vehicle & Fuel Expenses",
            "impact": "+12 points",
            "desc": "Categorizing fuel and maintenance builds transparent net income history."
        })

    return jsonify({
        "score": total_score,
        "tier": tier,
        "tier_hi": tier_hi,
        "color": color,
        "headline_summary": headline_summary,
        "factors": [
            {
                "name": "Income Logging Consistency",
                "score": logging_score,
                "max": 35,
                "status": logging_status,
                "icon": "CalendarCheck"
            },
            {
                "name": "Net Income Stability",
                "score": stability_score,
                "max": 40,
                "status": stability_status,
                "icon": "TrendingUp"
            },
            {
                "name": "Social Security & Schemes",
                "score": scheme_score,
                "max": 25,
                "status": scheme_status,
                "icon": "ShieldCheck"
            }
        ],
        "tips": tips
    })

# ---------------------------------------------------------------------------
# DEMO DATA RESET ENDPOINT
# ---------------------------------------------------------------------------
@app.route("/api/demo/reset", methods=["POST"])
def reset_demo():
    seed_database()
    return jsonify({"success": True, "message": "Demo database refreshed with 6 months of historical data!"})

# ---------------------------------------------------------------------------
# STATIC FRONTEND SERVING
# ---------------------------------------------------------------------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path.startswith("api/"):
        return jsonify({"error": "API endpoint not found"}), 404
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    print("[SahiHisaab Flask API & Web App] Running on http://localhost:5000...")
    app.run(host="0.0.0.0", port=5000, debug=True)
