import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def generate_pdf():
    pdf_filename = "SahiHisaab_Tab_Guide.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Colors
    NAVY = colors.HexColor("#1E2761")
    BLUE = colors.HexColor("#2E86DE")
    GREEN = colors.HexColor("#16A085")
    ORANGE = colors.HexColor("#F39C12")
    DARK_TEXT = colors.HexColor("#2C3E50")
    MUTED_TEXT = colors.HexColor("#7F8C8D")
    LIGHT_BG = colors.HexColor("#F4F6F9")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=NAVY,
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=GREEN,
        alignment=TA_LEFT
    )
    
    meta_style = ParagraphStyle(
        'MetaText',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=MUTED_TEXT,
        alignment=TA_LEFT
    )
    
    section_heading = ParagraphStyle(
        'SecHead',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=NAVY,
        spaceBefore=10,
        spaceAfter=6
    )
    
    tab_title_style = ParagraphStyle(
        'TabTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=NAVY
    )
    
    tab_desc_style = ParagraphStyle(
        'TabDesc',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=DARK_TEXT
    )
    
    tab_value_style = ParagraphStyle(
        'TabValue',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=GREEN
    )

    story = []

    # Document Header Banner
    story.append(Paragraph("SahiHisaab (Sahih Hisaab)", title_style))
    story.append(Paragraph("Financial Clarity Dashboard for Indian Gig Workers — Complete Tab & Feature Guide", subtitle_style))
    story.append(Paragraph("Prepared for User: <b>Rahul Kaushik</b> (+91 9876543210) | Pilot Version: 1.0 (Hackathon / Ideathon MVP)", meta_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=12))

    # Executive Overview Box
    overview_text = Paragraph(
        "<b>Executive Summary:</b> SahiHisaab solves cash-flow opacity for over 12 million Indian gig workers "
        "(delivery partners on Zomato/Swiggy, ride-hailing drivers on Uber/Ola/Rapido, and home service providers). "
        "It provides real-time income logging (manual + screenshot OCR parsing), operational expense tracking, "
        "bilingual support (English & Hindi), a rules-based government scheme eligibility engine, and a 0-100 Credit-Readiness score.",
        ParagraphStyle('Overview', fontName='Helvetica', fontSize=8.8, leading=12, textColor=DARK_TEXT)
    )
    overview_table = Table([[overview_text]], colWidths=[540])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EBF3FA")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#2E86DE")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 12))

    # Section 2: Tab-by-Tab Detailed Breakdown Table
    story.append(Paragraph("Detailed Breakdown of Every Application Tab / Page", section_heading))

    tabs_data = [
        [
            Paragraph("<b>Tab / Route</b>", ParagraphStyle('TH1', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
            Paragraph("<b>Core Functionality & User Flow</b>", ParagraphStyle('TH2', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
            Paragraph("<b>Gig Worker Value & Impact</b>", ParagraphStyle('TH3', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white))
        ],
        [
            Paragraph("<b>1. /login</b><br/><font color='#7F8C8D'>Phone + OTP Auth</font>", tab_title_style),
            Paragraph("• Enter 10-digit mobile number + 6-digit OTP (mock OTP: <i>123456</i>).<br/>• <b>Quick Demo Login</b> preset for pilot user <b>Rahul Kaushik</b>.", tab_desc_style),
            Paragraph("Zero password barrier for non-tech-savvy drivers & delivery partners.", tab_value_style)
        ],
        [
            Paragraph("<b>2. /dashboard</b><br/><font color='#7F8C8D'>Financial Overview</font>", tab_title_style),
            Paragraph("• <b>Net Income Hero Card</b>: Large metric displaying Gross Earnings - Expenses.<br/>• Timeframe filter (<i>This Month</i>, <i>Last 30 Days</i>, <i>All Time</i>).<br/>• <b>Expense Breakdown Bar Chart</b> (Fuel, EMI, Recharge, Maintenance).<br/>• <b>6-Month Net Income Trend Line</b> (Apr-Sep 2026 data).<br/>• Recent Activity Log with instant delete actions.", tab_desc_style),
            Paragraph("Provides instant clarity on true take-home cash flow after vehicle & fuel expenses.", tab_value_style)
        ],
        [
            Paragraph("<b>3. /add-income</b><br/><font color='#7F8C8D'>Earnings Logging</font>", tab_title_style),
            Paragraph("• <b>Tab 1 (Manual Entry)</b>: Platform dropdown (Zomato, Swiggy, Uber, Rapido, Ola, Urban Company, Other), amount in Rs, date, notes.<br/>• <b>Tab 2 (Photo OCR Entry)</b>: Upload Swiggy/Zomato payout screenshot -> auto-extracts platform & amount for user confirmation before saving.", tab_desc_style),
            Paragraph("Eliminates typing friction via automated screenshot scanning.", tab_value_style)
        ],
        [
            Paragraph("<b>4. /add-expense</b><br/><font color='#7F8C8D'>Expense Tracking</font>", tab_title_style),
            Paragraph("• Categorized logging for Fuel, Vehicle EMI, Phone Recharge, Maintenance, and Other.<br/>• <b>1-Tap Quick Amount Pills</b> (Rs 150, Rs 300, Rs 500, Rs 1000, Rs 3200).", tab_desc_style),
            Paragraph("Prevents hidden expense leaks from inflating apparent profit.", tab_value_style)
        ],
        [
            Paragraph("<b>5. /schemes</b><br/><font color='#7F8C8D'>Govt Scheme Engine</font>", tab_title_style),
            Paragraph("• Questionnaire: Age, Monthly Income Band, State, Gig Category.<br/>• Rules-based evaluation for <b>e-Shram</b>, <b>PM-SYM</b>, <b>PMJJBY</b>, and <b>PMSBY</b>.<br/>• Cards with eligibility badges, benefit descriptions, enrollment toggles.<br/>• <b>How to Enroll Modal</b> with step-by-step guides & official portal links.", tab_desc_style),
            Paragraph("Connects unorganized workers to Rs 2 Lakh insurance cover & pensions.", tab_value_style)
        ],
        [
            Paragraph("<b>6. /score</b><br/><font color='#7F8C8D'>Credit-Readiness</font>", tab_title_style),
            Paragraph("• <b>0-100 SVG Gauge Visual</b> rating creditworthiness.<br/>• Score Pillars: Income Regularity (35 pts), Income Stability (40 pts), Scheme Coverage (25 pts).<br/>• Tier labels (<i>Prime</i>, <i>Good</i>, <i>Fair</i>, <i>Building</i>) + actionable score booster tips.", tab_desc_style),
            Paragraph("Unlocks lower-interest micro-loan approval odds from digital lenders.", tab_value_style)
        ],
        [
            Paragraph("<b>7. /profile</b><br/><font color='#7F8C8D'>User & Pilot Settings</font>", tab_title_style),
            Paragraph("• Edit Name, Phone, Gig Category, and City.<br/>• <b>English / Hindi</b> dynamic language toggle.<br/>• <b>Reset Demo Database</b> button to restore fresh 6-month historical entries.", tab_desc_style),
            Paragraph("Full bilingual accessibility & seamless pilot presentation reset.", tab_value_style)
        ]
    ]

    table = Table(tabs_data, colWidths=[120, 270, 150])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))

    story.append(table)
    story.append(Spacer(1, 14))

    # Architecture & Key Technical Attributes
    story.append(Paragraph("Key Technical Highlights", section_heading))
    tech_text = Paragraph(
        "• <b>Mobile-First Responsive Layout</b>: Optimized for low-end Android smartphones and in-app webviews.<br/>"
        "• <b>Zero-Config SQLite / Supabase Integration</b>: Out-of-the-box local database with standard SQL migrations for PostgreSQL production scaling.<br/>"
        "• <b>Single-Port Execution</b>: Flask REST server directly hosts the bundled ESBuild React application on port 5000.",
        ParagraphStyle('TechNotes', fontName='Helvetica', fontSize=8.5, leading=12, textColor=DARK_TEXT)
    )
    story.append(tech_text)

    doc.build(story)
    print(f"Generated compact PDF guide at: {os.path.abspath(pdf_filename)}")

if __name__ == "__main__":
    generate_pdf()
