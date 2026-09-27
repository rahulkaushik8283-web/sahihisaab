import uuid
from datetime import datetime, timedelta
from db import get_db_connection, init_db

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if demo user already exists
    cursor.execute("SELECT * FROM users WHERE phone = ?", ("9876543210",))
    existing_user = cursor.fetchone()
    
    demo_user_id = existing_user["id"] if existing_user else "user_demo_rahul_123"
    
    if not existing_user:
        cursor.execute(
            """INSERT INTO users (id, phone, name, gig_category, city, age, monthly_income_band, state)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (demo_user_id, "9876543210", "Rahul Kaushik", "Delivery Partner", "Delhi NCR", 26, "25k_35k", "Delhi")
        )
        print(f"[Seed] Created demo user: Rahul Kaushik (+91 9876543210)")
    else:
        cursor.execute("UPDATE users SET name = ? WHERE id = ?", ("Rahul Kaushik", demo_user_id))
        print(f"[Seed] Updated demo user name to: Rahul Kaushik (+91 9876543210)")
        
    # Clear existing entries for demo user to avoid duplicates on re-run
    cursor.execute("DELETE FROM income_entries WHERE user_id = ?", (demo_user_id,))
    cursor.execute("DELETE FROM expense_entries WHERE user_id = ?", (demo_user_id,))
    cursor.execute("DELETE FROM scheme_eligibility WHERE user_id = ?", (demo_user_id,))
    
    today = datetime.now()
    
    income_records = [
        # Current month (Sept 2026)
        ("Zomato", 1450.00, today - timedelta(days=1), "manual", "Weekend peak delivery incentive"),
        ("Swiggy", 1200.00, today - timedelta(days=2), "ocr", "Uploaded Swiggy payout screenshot"),
        ("Uber", 850.00, today - timedelta(days=4), "manual", "Airport drop rides"),
        ("Zomato", 1680.00, today - timedelta(days=6), "manual", "Dinner rush orders"),
        ("Swiggy", 1320.00, today - timedelta(days=8), "manual", "Rain bonus payout"),
        ("Urban Company", 2100.00, today - timedelta(days=11), "manual", "AC Repair assistance gig"),
        ("Zomato", 1550.00, today - timedelta(days=14), "manual", "Mid-week earnings"),
        ("Rapido", 780.00, today - timedelta(days=17), "manual", "Morning peak bike rides"),
        ("Swiggy", 1890.00, today - timedelta(days=20), "ocr", "Weekly statement payout"),
        ("Zomato", 1600.00, today - timedelta(days=23), "manual", "Sunday lunch & dinner shifts"),

        # Month -1 (Aug 2026)
        ("Zomato", 15200.00, today - timedelta(days=32), "manual", "Monthly payout batch 1"),
        ("Swiggy", 13400.00, today - timedelta(days=45), "manual", "Monthly payout batch 2"),
        ("Rapido", 4200.00, today - timedelta(days=55), "manual", "Bike rides cumulative"),

        # Month -2 (July 2026)
        ("Zomato", 14800.00, today - timedelta(days=62), "manual", "July payout Zomato"),
        ("Swiggy", 12900.00, today - timedelta(days=75), "manual", "July payout Swiggy"),
        ("Uber", 5100.00, today - timedelta(days=85), "manual", "July passenger rides"),

        # Month -3 (June 2026)
        ("Zomato", 13900.00, today - timedelta(days=93), "manual", "June payout Zomato"),
        ("Swiggy", 12100.00, today - timedelta(days=105), "manual", "June payout Swiggy"),
        ("Rapido", 3800.00, today - timedelta(days=115), "manual", "June rides"),

        # Month -4 (May 2026)
        ("Zomato", 15100.00, today - timedelta(days=125), "manual", "May payout Zomato"),
        ("Swiggy", 11500.00, today - timedelta(days=138), "manual", "May payout Swiggy"),
        ("Urban Company", 4500.00, today - timedelta(days=145), "manual", "May appliance gigs"),

        # Month -5 (April 2026)
        ("Zomato", 13200.00, today - timedelta(days=155), "manual", "April payout Zomato"),
        ("Swiggy", 10800.00, today - timedelta(days=168), "manual", "April payout Swiggy"),
    ]
    
    for platform, amount, date_obj, source, notes in income_records:
        cursor.execute(
            """INSERT INTO income_entries (id, user_id, platform, amount, date, source, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (f"inc_{uuid.uuid4().hex[:10]}", demo_user_id, platform, amount, date_obj.strftime("%Y-%m-%d"), source, notes)
        )
        
    expense_records = [
        # Current month expenses
        ("Fuel", 3800.00, today - timedelta(days=2), "Petrol refill for Splendor bike"),
        ("Vehicle EMI", 3200.00, today - timedelta(days=5), "Hero MotoCorp monthly EMI"),
        ("Phone Recharge", 479.00, today - timedelta(days=10), "Jio 84 days unlimited plan"),
        ("Maintenance", 1250.00, today - timedelta(days=15), "Bike oil change and brake pads"),
        ("Other", 950.00, today - timedelta(days=19), "Delivery bag repair & helmet lock"),

        # Month -1 expenses
        ("Fuel", 4100.00, today - timedelta(days=33), "Monthly petrol expenditure"),
        ("Vehicle EMI", 3200.00, today - timedelta(days=35), "Monthly bike loan EMI"),
        ("Maintenance", 850.00, today - timedelta(days=48), "Tyre puncture repair & wash"),

        # Month -2 expenses
        ("Fuel", 3900.00, today - timedelta(days=63), "Monthly petrol expenditure"),
        ("Vehicle EMI", 3200.00, today - timedelta(days=65), "Monthly bike loan EMI"),
        ("Phone Recharge", 479.00, today - timedelta(days=78), "Airtel data recharge"),

        # Month -3 expenses
        ("Fuel", 3700.00, today - timedelta(days=94), "Monthly petrol expenditure"),
        ("Vehicle EMI", 3200.00, today - timedelta(days=96), "Monthly bike loan EMI"),

        # Month -4 expenses
        ("Fuel", 4200.00, today - timedelta(days=124), "Monthly petrol expenditure"),
        ("Vehicle EMI", 3200.00, today - timedelta(days=126), "Monthly bike loan EMI"),
        ("Maintenance", 1600.00, today - timedelta(days=135), "Major service & clutch wire"),

        # Month -5 expenses
        ("Fuel", 3600.00, today - timedelta(days=154), "Monthly petrol expenditure"),
        ("Vehicle EMI", 3200.00, today - timedelta(days=156), "Monthly bike loan EMI"),
    ]
    
    for category, amount, date_obj, desc in expense_records:
        cursor.execute(
            """INSERT INTO expense_entries (id, user_id, category, amount, date, description)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (f"exp_{uuid.uuid4().hex[:10]}", demo_user_id, category, amount, date_obj.strftime("%Y-%m-%d"), desc)
        )
        
    schemes = [
        ("eshram", "e-Shram (National Database of Unorganized Workers)", 1, 1),
        ("pmsym", "Pradhan Mantri Shram Yogi Maandhan (PM-SYM)", 1, 1),
        ("pmjjby", "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)", 1, 0),
        ("pmsby", "Pradhan Mantri Suraksha Bima Yojana (PMSBY)", 1, 1),
    ]
    
    for code, name, eligible, enrolled in schemes:
        cursor.execute(
            """INSERT INTO scheme_eligibility (id, user_id, scheme_code, scheme_name, eligible, enrolled)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (f"sch_{uuid.uuid4().hex[:10]}", demo_user_id, code, name, eligible, enrolled)
        )

    conn.commit()
    conn.close()
    print("[Seed] Successfully seeded demo data for user: Rahul Kaushik!")

if __name__ == "__main__":
    seed_database()
