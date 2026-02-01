#!/usr/bin/env python3
"""
SERA 2026 Financial Overview Generator
Generates a beautifully designed PDF and CSV summary of all event budgets
Brand Colors: Dark Blue #2E4A7D, Green #7AB547
"""

import csv
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect, String, Line
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics import renderPDF
from datetime import datetime
import os

# ═══════════════════════════════════════════════════════════════════════════
# SERA BRAND COLORS (from provided image)
# ═══════════════════════════════════════════════════════════════════════════
SERA_BLUE = colors.HexColor('#2E4A7D')      # Dark navy blue
SERA_GREEN = colors.HexColor('#7AB547')     # Bright lime green
SERA_LIGHT_BLUE = colors.HexColor('#4A6FA5')  # Lighter blue for accents
SERA_LIGHT_GREEN = colors.HexColor('#A8D977') # Lighter green
SERA_DARK = colors.HexColor('#1E3259')      # Very dark blue
SERA_GRAY = colors.HexColor('#F5F5F5')      # Light gray background
WHITE = colors.white
BLACK = colors.black

# ═══════════════════════════════════════════════════════════════════════════
# COMPLETE EVENT DATA WITH BUDGETS
# ═══════════════════════════════════════════════════════════════════════════
events_data = [
    # Q1 Events (9 events)
    {"num": 1, "name_en": "Annual Meeting 2026", "name_ar": "الاجتماع السنوي", "date": "February 3", "quarter": "Q1", "category": "Corporate Conference", "attendance": 300, "tier": "Major", "subtotal": 286500, "commission": 42975, "total": 329475},
    {"num": 2, "name_en": "Founding Day", "name_ar": "يوم التأسيس", "date": "February 22", "quarter": "Q1", "category": "National Celebration", "attendance": 300, "tier": "Light", "subtotal": 63100, "commission": 9465, "total": 72565},
    {"num": 3, "name_en": "Employee Appreciation Day", "name_ar": "يوم تقدير الموظف", "date": "March 2", "quarter": "Q1", "category": "Recognition Gala", "attendance": 300, "tier": "Major", "subtotal": 223000, "commission": 33450, "total": 256450},
    {"num": 4, "name_en": "International Women's Day", "name_ar": "اليوم العالمي للمرأة", "date": "March 8", "quarter": "Q1", "category": "Awareness/Celebration", "attendance": 150, "tier": "Medium", "subtotal": 115250, "commission": 17288, "total": 132538},
    {"num": 5, "name_en": "Saudi Flag Day", "name_ar": "يوم العلم السعودي", "date": "March 11", "quarter": "Q1", "category": "Patriotic Celebration", "attendance": 300, "tier": "Light", "subtotal": 65400, "commission": 9810, "total": 75210},
    {"num": 6, "name_en": "Ramadan Iftar", "name_ar": "إفطار رمضان", "date": "Mid-March", "quarter": "Q1", "category": "Corporate Iftar", "attendance": 300, "tier": "Major", "subtotal": 213800, "commission": 32070, "total": 245870},
    {"num": 7, "name_en": "Mother's Day", "name_ar": "يوم الأم", "date": "March 21", "quarter": "Q1", "category": "Appreciation Event", "attendance": 130, "tier": "Medium", "subtotal": 74925, "commission": 11239, "total": 86164},
    {"num": 8, "name_en": "Saudi Green Initiative", "name_ar": "المبادرة الخضراء السعودية", "date": "March 27", "quarter": "Q1", "category": "Sustainability Awareness", "attendance": 250, "tier": "Light", "subtotal": 45500, "commission": 6825, "total": 52325},
    {"num": 9, "name_en": "Ehsan Philanthropy Campaign", "name_ar": "حملة إحسان", "date": "March", "quarter": "Q1", "category": "CSR/Charity", "attendance": 200, "tier": "Light", "subtotal": 42000, "commission": 6300, "total": 48300},

    # Q2 Events (8 events)
    {"num": 10, "name_en": "Eid Al-Fitr Celebration", "name_ar": "احتفال عيد الفطر", "date": "Early April", "quarter": "Q2", "category": "Major Gala", "attendance": 300, "tier": "Major", "subtotal": 289500, "commission": 43425, "total": 332925},
    {"num": 11, "name_en": "Creativity & Innovation Day", "name_ar": "يوم الإبداع والابتكار", "date": "April 21", "quarter": "Q2", "category": "Professional Development", "attendance": 200, "tier": "Medium", "subtotal": 176000, "commission": 26400, "total": 202400},
    {"num": 12, "name_en": "International Tea Day", "name_ar": "اليوم العالمي للشاي", "date": "May 21", "quarter": "Q2", "category": "Social/Wellness", "attendance": 250, "tier": "Light", "subtotal": 48000, "commission": 7200, "total": 55200},
    {"num": 13, "name_en": "Joy Clothing Drive", "name_ar": "كسوة فرح", "date": "May", "quarter": "Q2", "category": "CSR/Charity", "attendance": 200, "tier": "Light", "subtotal": 44000, "commission": 6600, "total": 50600},
    {"num": 14, "name_en": "World No Tobacco Day", "name_ar": "اليوم العالمي لمكافحة التدخين", "date": "May 31", "quarter": "Q2", "category": "Health Awareness", "attendance": 200, "tier": "Light", "subtotal": 58600, "commission": 8790, "total": 67390},
    {"num": 15, "name_en": "Blood Donation Day", "name_ar": "يوم التبرع بالدم", "date": "June 14", "quarter": "Q2", "category": "CSR/Health", "attendance": 120, "tier": "Light", "subtotal": 30300, "commission": 4545, "total": 34845},
    {"num": 16, "name_en": "Father's Day", "name_ar": "يوم الأب", "date": "June 15", "quarter": "Q2", "category": "Appreciation Event", "attendance": 160, "tier": "Medium", "subtotal": 74900, "commission": 11235, "total": 86135},
    {"num": 17, "name_en": "Eid Al-Adha Celebration", "name_ar": "احتفال عيد الأضحى", "date": "Mid-June", "quarter": "Q2", "category": "Major Gala", "attendance": 300, "tier": "Major", "subtotal": 274500, "commission": 41175, "total": 315675},

    # Q3 Events (8 events)
    {"num": 18, "name_en": "Summer SERA", "name_ar": "صيف سيرا", "date": "July 20", "quarter": "Q3", "category": "Seasonal Family Event", "attendance": 500, "tier": "Major", "subtotal": 363500, "commission": 54525, "total": 418025},
    {"num": 19, "name_en": "SERA Winter", "name_ar": "شتوية سيرا", "date": "August 19", "quarter": "Q3", "category": "Seasonal Indoor Event", "attendance": 300, "tier": "Medium", "subtotal": 118000, "commission": 17700, "total": 135700},
    {"num": 20, "name_en": "World First Aid Day", "name_ar": "اليوم العالمي للإسعافات الأولية", "date": "September 13", "quarter": "Q3", "category": "Health Awareness", "attendance": 200, "tier": "Light", "subtotal": 59000, "commission": 8850, "total": 67850},
    {"num": 21, "name_en": "تزود Skills Development", "name_ar": "تزوّد", "date": "September", "quarter": "Q3", "category": "Professional Development", "attendance": 200, "tier": "Medium", "subtotal": 103500, "commission": 15525, "total": 119025},
    {"num": 22, "name_en": "World Alzheimer's Day", "name_ar": "اليوم العالمي للزهايمر", "date": "September 21", "quarter": "Q3", "category": "Health Awareness", "attendance": 200, "tier": "Light", "subtotal": 32500, "commission": 4875, "total": 37375},
    {"num": 23, "name_en": "وش دورنا – What's Our Role", "name_ar": "وش دورنا", "date": "September", "quarter": "Q3", "category": "Internal Engagement", "attendance": 200, "tier": "Light", "subtotal": 51600, "commission": 7740, "total": 59340},
    {"num": 24, "name_en": "Saudi National Day (96th)", "name_ar": "اليوم الوطني السعودي", "date": "September 23", "quarter": "Q3", "category": "National Celebration", "attendance": 300, "tier": "Major", "subtotal": 358500, "commission": 53775, "total": 412275},
    {"num": 25, "name_en": "Environment Week", "name_ar": "أسبوع البيئة", "date": "Q3 TBD", "quarter": "Q3", "category": "Sustainability Awareness", "attendance": 250, "tier": "Medium", "subtotal": 83000, "commission": 12450, "total": 95450},

    # Q4 Events (16 events)
    {"num": 26, "name_en": "International Coffee Day", "name_ar": "اليوم العالمي للقهوة", "date": "October 1", "quarter": "Q4", "category": "Social/Wellness", "attendance": 250, "tier": "Light", "subtotal": 47250, "commission": 7088, "total": 54338},
    {"num": 27, "name_en": "Breast Cancer Awareness Day", "name_ar": "اليوم العالمي لسرطان الثدي", "date": "October", "quarter": "Q4", "category": "Health Awareness", "attendance": 200, "tier": "Light", "subtotal": 46000, "commission": 6900, "total": 52900},
    {"num": 28, "name_en": "Cybersecurity Exhibition", "name_ar": "معرض الأمن السيبراني", "date": "October TBD", "quarter": "Q4", "category": "Professional/Awareness", "attendance": 250, "tier": "Medium", "subtotal": 176750, "commission": 26513, "total": 203263},
    {"num": 29, "name_en": "World Mental Health Day", "name_ar": "اليوم العالمي للصحة النفسية", "date": "October 10", "quarter": "Q4", "category": "Health Awareness", "attendance": 200, "tier": "Light", "subtotal": 54000, "commission": 8100, "total": 62100},
    {"num": 30, "name_en": "World Savings Day", "name_ar": "اليوم العالمي للادخار", "date": "October 31", "quarter": "Q4", "category": "Financial Awareness", "attendance": 200, "tier": "Light", "subtotal": 45000, "commission": 6750, "total": 51750},
    {"num": 31, "name_en": "Quality Day", "name_ar": "يوم الجودة", "date": "November 10", "quarter": "Q4", "category": "Professional Development", "attendance": 180, "tier": "Medium", "subtotal": 76600, "commission": 11490, "total": 88090},
    {"num": 32, "name_en": "Flu Vaccination Campaign", "name_ar": "حملة التطعيم ضد الإنفلونزا", "date": "November", "quarter": "Q4", "category": "Health Campaign", "attendance": 250, "tier": "Light", "subtotal": 46750, "commission": 7013, "total": 53763},
    {"num": 33, "name_en": "World Diabetes Day", "name_ar": "اليوم العالمي للسكري", "date": "November 14", "quarter": "Q4", "category": "Health Awareness", "attendance": 200, "tier": "Light", "subtotal": 47000, "commission": 7050, "total": 54050},
    {"num": 34, "name_en": "International Men's Day", "name_ar": "اليوم العالمي للرجل", "date": "November 19", "quarter": "Q4", "category": "Appreciation Event", "attendance": 200, "tier": "Medium", "subtotal": 75500, "commission": 11325, "total": 86825},
    {"num": 35, "name_en": "Universal Children's Day", "name_ar": "اليوم العالمي للطفل", "date": "November 20", "quarter": "Q4", "category": "CSR/Family", "attendance": 200, "tier": "Medium", "subtotal": 87000, "commission": 13050, "total": 100050},
    {"num": 36, "name_en": "Volunteer Day", "name_ar": "يوم التطوع", "date": "December 5", "quarter": "Q4", "category": "CSR Activity", "attendance": 80, "tier": "Light", "subtotal": 29600, "commission": 4440, "total": 34040},
    {"num": 37, "name_en": "Anti-Corruption Day", "name_ar": "اليوم العالمي لمكافحة الفساد", "date": "December 9", "quarter": "Q4", "category": "Awareness", "attendance": 200, "tier": "Light", "subtotal": 47500, "commission": 7125, "total": 54625},
    {"num": 38, "name_en": "Transformation Activities", "name_ar": "أنشطة ومبادرات التحول", "date": "Q4 TBD", "quarter": "Q4", "category": "Digital Transformation", "attendance": 200, "tier": "Medium", "subtotal": 63000, "commission": 9450, "total": 72450},
    {"num": 39, "name_en": "Ideal Office Competition", "name_ar": "المكتب المثالي", "date": "Q4 TBD", "quarter": "Q4", "category": "Internal Competition", "attendance": 200, "tier": "Light", "subtotal": 51500, "commission": 7725, "total": 59225},
    {"num": 40, "name_en": "Arabic Language Day", "name_ar": "اليوم العالمي للغة العربية", "date": "December 18", "quarter": "Q4", "category": "Cultural Celebration", "attendance": 200, "tier": "Medium", "subtotal": 80500, "commission": 12075, "total": 92575},
    {"num": 41, "name_en": "Year-End Celebration", "name_ar": "حفل نهاية العام", "date": "Late December", "quarter": "Q4", "category": "Major Gala", "attendance": 300, "tier": "Major", "subtotal": 356500, "commission": 53475, "total": 409975},
]

# Sports Data
sports_data = [
    {"name_en": "Football Tournament", "name_ar": "بطولة كرة القدم", "participants": 150, "subtotal": 126880, "commission": 19032, "total": 145912},
    {"name_en": "Padel Tournament", "name_ar": "بطولة البادل", "participants": 20, "subtotal": 53540, "commission": 8031, "total": 61571},
    {"name_en": "Walking Challenge & SERA Friday", "name_ar": "تحدي المشي + جمعة سيرا", "participants": 200, "subtotal": 139000, "commission": 20850, "total": 159850},
]

# Newsletters
newsletters = {"subtotal": 505100, "commission": 75765, "total": 580865}


def format_sar(amount):
    """Format amount in SAR with thousands separator"""
    return f"{amount:,.0f}"


def create_header_footer(canvas, doc):
    """Draw custom header and footer on each page"""
    canvas.saveState()
    width, height = landscape(A4)

    # Header bar - dark blue
    canvas.setFillColor(SERA_BLUE)
    canvas.rect(0, height - 60, width, 60, fill=1, stroke=0)

    # Green accent line under header
    canvas.setFillColor(SERA_GREEN)
    canvas.rect(0, height - 65, width, 5, fill=1, stroke=0)

    # Header text
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 18)
    canvas.drawString(30, height - 40, "SERA 2026")
    canvas.setFont("Helvetica", 12)
    canvas.drawString(130, height - 40, "Financial Overview & Budget Summary")

    # Arabic text on right
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawRightString(width - 30, height - 40, "هيئة تنظيم الكهرباء")

    # Footer bar
    canvas.setFillColor(SERA_GREEN)
    canvas.rect(0, 0, width, 30, fill=1, stroke=0)

    # Footer text
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 9)
    canvas.drawString(30, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    canvas.drawCentredString(width/2, 10, "Saudi Electricity Regulatory Authority | All Events in Riyadh | Agency Commission: 15%")
    canvas.drawRightString(width - 30, 10, f"Page {doc.page}")

    canvas.restoreState()


def generate_pdf(output_path):
    """Generate the beautifully designed PDF"""

    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(A4),
        rightMargin=30,
        leftMargin=30,
        topMargin=80,
        bottomMargin=50
    )

    elements = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=SERA_BLUE,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=SERA_DARK,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )

    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=SERA_BLUE,
        spaceBefore=20,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 1: EXECUTIVE SUMMARY
    # ═══════════════════════════════════════════════════════════════════════

    elements.append(Paragraph("SERA 2026 Annual Events Program", title_style))
    elements.append(Paragraph("Financial Overview & Budget Summary", subtitle_style))
    elements.append(Spacer(1, 20))

    # Calculate totals
    q1_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q1')
    q2_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q2')
    q3_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q3')
    q4_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q4')
    events_total = sum(e['total'] for e in events_data)
    sports_total = sum(s['total'] for s in sports_data)
    grand_total_ex_vat = events_total + sports_total + newsletters['total']
    vat = grand_total_ex_vat * 0.15
    grand_total_inc_vat = grand_total_ex_vat + vat

    # Executive Summary Table
    summary_data = [
        ['EXECUTIVE SUMMARY', '', '', ''],
        ['Category', 'Events', 'Budget (SAR)', '% of Total'],
        ['Q1 Events (Jan-Mar)', '9', format_sar(q1_total), f"{q1_total/grand_total_ex_vat*100:.1f}%"],
        ['Q2 Events (Apr-Jun)', '8', format_sar(q2_total), f"{q2_total/grand_total_ex_vat*100:.1f}%"],
        ['Q3 Events (Jul-Sep)', '8', format_sar(q3_total), f"{q3_total/grand_total_ex_vat*100:.1f}%"],
        ['Q4 Events (Oct-Dec)', '16', format_sar(q4_total), f"{q4_total/grand_total_ex_vat*100:.1f}%"],
        ['Sports Events', '3', format_sar(sports_total), f"{sports_total/grand_total_ex_vat*100:.1f}%"],
        ['Weekly Newsletters', '52', format_sar(newsletters['total']), f"{newsletters['total']/grand_total_ex_vat*100:.1f}%"],
        ['', '', '', ''],
        ['GRAND TOTAL (Excl. VAT)', '44 + 52 issues', format_sar(grand_total_ex_vat), '100%'],
        ['VAT (15%)', '', format_sar(vat), ''],
        ['GRAND TOTAL (Incl. VAT)', '', format_sar(grand_total_inc_vat), ''],
    ]

    summary_table = Table(summary_data, colWidths=[200, 100, 150, 100])
    summary_table.setStyle(TableStyle([
        # Title row
        ('SPAN', (0, 0), (3, 0)),
        ('BACKGROUND', (0, 0), (3, 0), SERA_BLUE),
        ('TEXTCOLOR', (0, 0), (3, 0), WHITE),
        ('FONTNAME', (0, 0), (3, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (3, 0), 14),
        ('ALIGN', (0, 0), (3, 0), 'CENTER'),

        # Header row
        ('BACKGROUND', (0, 1), (3, 1), SERA_GREEN),
        ('TEXTCOLOR', (0, 1), (3, 1), WHITE),
        ('FONTNAME', (0, 1), (3, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (3, 1), 11),

        # Data rows
        ('FONTNAME', (0, 2), (-1, -4), 'Helvetica'),
        ('FONTSIZE', (0, 2), (-1, -1), 10),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('ALIGN', (2, 1), (2, -1), 'RIGHT'),

        # Totals section
        ('BACKGROUND', (0, 9), (3, 9), SERA_BLUE),
        ('TEXTCOLOR', (0, 9), (3, 9), WHITE),
        ('FONTNAME', (0, 9), (3, 9), 'Helvetica-Bold'),

        ('BACKGROUND', (0, 11), (3, 11), SERA_DARK),
        ('TEXTCOLOR', (0, 11), (3, 11), WHITE),
        ('FONTNAME', (0, 11), (3, 11), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 11), (3, 11), 12),

        # Borders
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 2, SERA_BLUE),

        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))

    elements.append(summary_table)
    elements.append(Spacer(1, 30))

    # Key Highlights
    highlights_data = [
        ['KEY HIGHLIGHTS', '', ''],
        ['Total Annual Events', '41 events + 3 sports + 52 newsletters', ''],
        ['Total Attendance (Est.)', '~9,000+ participants across all events', ''],
        ['Major Gala Events', '7 (Annual Meeting, Eid x2, National Day, Summer, Year-End)', ''],
        ['Agency Commission', '15% on all events and activities', ''],
        ['Price Validity', '90 days from proposal date', ''],
    ]

    highlights_table = Table(highlights_data, colWidths=[180, 350, 20])
    highlights_table.setStyle(TableStyle([
        ('SPAN', (0, 0), (2, 0)),
        ('BACKGROUND', (0, 0), (2, 0), SERA_GREEN),
        ('TEXTCOLOR', (0, 0), (2, 0), WHITE),
        ('FONTNAME', (0, 0), (2, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (2, 0), 12),
        ('ALIGN', (0, 0), (2, 0), 'CENTER'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), SERA_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 1, SERA_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    elements.append(highlights_table)
    elements.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 2: Q1 & Q2 EVENTS
    # ═══════════════════════════════════════════════════════════════════════

    elements.append(Paragraph("Q1 & Q2 Events Detail (January - June 2026)", section_style))

    q1_q2_events = [e for e in events_data if e['quarter'] in ('Q1', 'Q2')]

    events_header = ['#', 'Event Name', 'Arabic', 'Date', 'Category', 'Pax', 'Budget (SAR)']
    events_rows = [events_header]

    for e in q1_q2_events:
        if e['num'] == 10:  # Start of Q2
            events_rows.append(['', 'Q2 EVENTS', '', '', '', '', ''])
        if e['num'] == 1:
            events_rows.append(['', 'Q1 EVENTS', '', '', '', '', ''])
        events_rows.append([
            str(e['num']),
            e['name_en'][:30],
            e['name_ar'],
            e['date'],
            e['category'][:20],
            str(e['attendance']),
            format_sar(e['total'])
        ])

    # Q1 subtotal
    events_rows.insert(10, ['', 'Q1 SUBTOTAL', '', '', '', '', format_sar(q1_total)])
    # Q2 subtotal
    events_rows.append(['', 'Q2 SUBTOTAL', '', '', '', '', format_sar(q2_total)])

    q1q2_table = Table(events_rows, colWidths=[30, 160, 100, 70, 120, 40, 90])
    q1q2_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), SERA_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),

        # Q1 section header
        ('BACKGROUND', (0, 1), (-1, 1), SERA_LIGHT_GREEN),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('SPAN', (1, 1), (-1, 1)),

        # Q1 subtotal row (row 11)
        ('BACKGROUND', (0, 11), (-1, 11), SERA_GREEN),
        ('TEXTCOLOR', (0, 11), (-1, 11), WHITE),
        ('FONTNAME', (0, 11), (-1, 11), 'Helvetica-Bold'),

        # Q2 section header (row 12)
        ('BACKGROUND', (0, 12), (-1, 12), SERA_LIGHT_GREEN),
        ('FONTNAME', (0, 12), (-1, 12), 'Helvetica-Bold'),
        ('SPAN', (1, 12), (-1, 12)),

        # Q2 subtotal (last row)
        ('BACKGROUND', (0, -1), (-1, -1), SERA_GREEN),
        ('TEXTCOLOR', (0, -1), (-1, -1), WHITE),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),

        # General
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (5, 0), (5, -1), 'CENTER'),
        ('ALIGN', (6, 0), (6, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 1.5, SERA_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(q1q2_table)
    elements.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 3: Q3 & Q4 EVENTS
    # ═══════════════════════════════════════════════════════════════════════

    elements.append(Paragraph("Q3 & Q4 Events Detail (July - December 2026)", section_style))

    q3_q4_events = [e for e in events_data if e['quarter'] in ('Q3', 'Q4')]

    events_rows2 = [events_header]
    events_rows2.append(['', 'Q3 EVENTS', '', '', '', '', ''])

    for e in q3_q4_events:
        if e['num'] == 26:  # Start of Q4
            events_rows2.append(['', 'Q3 SUBTOTAL', '', '', '', '', format_sar(q3_total)])
            events_rows2.append(['', 'Q4 EVENTS', '', '', '', '', ''])
        events_rows2.append([
            str(e['num']),
            e['name_en'][:30],
            e['name_ar'],
            e['date'],
            e['category'][:20],
            str(e['attendance']),
            format_sar(e['total'])
        ])

    events_rows2.append(['', 'Q4 SUBTOTAL', '', '', '', '', format_sar(q4_total)])

    q3q4_table = Table(events_rows2, colWidths=[30, 160, 100, 70, 120, 40, 90])
    q3q4_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), SERA_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),

        # Q3 section header (row 1)
        ('BACKGROUND', (0, 1), (-1, 1), SERA_LIGHT_GREEN),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('SPAN', (1, 1), (-1, 1)),

        # Q3 subtotal (row 10)
        ('BACKGROUND', (0, 10), (-1, 10), SERA_GREEN),
        ('TEXTCOLOR', (0, 10), (-1, 10), WHITE),
        ('FONTNAME', (0, 10), (-1, 10), 'Helvetica-Bold'),

        # Q4 section header (row 11)
        ('BACKGROUND', (0, 11), (-1, 11), SERA_LIGHT_GREEN),
        ('FONTNAME', (0, 11), (-1, 11), 'Helvetica-Bold'),
        ('SPAN', (1, 11), (-1, 11)),

        # Q4 subtotal (last row)
        ('BACKGROUND', (0, -1), (-1, -1), SERA_GREEN),
        ('TEXTCOLOR', (0, -1), (-1, -1), WHITE),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),

        # General
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (5, 0), (5, -1), 'CENTER'),
        ('ALIGN', (6, 0), (6, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 1.5, SERA_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(q3q4_table)
    elements.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 4: SPORTS & NEWSLETTERS + GRAND TOTAL
    # ═══════════════════════════════════════════════════════════════════════

    elements.append(Paragraph("Sports Events & Newsletters", section_style))

    # Sports Table
    sports_header = ['Sport', 'Arabic', 'Participants', 'Subtotal (SAR)', 'Commission', 'Total (SAR)']
    sports_rows = [sports_header]
    for s in sports_data:
        sports_rows.append([
            s['name_en'],
            s['name_ar'],
            str(s['participants']),
            format_sar(s['subtotal']),
            format_sar(s['commission']),
            format_sar(s['total'])
        ])
    sports_rows.append(['SPORTS TOTAL', '', '', format_sar(sum(s['subtotal'] for s in sports_data)),
                        format_sar(sum(s['commission'] for s in sports_data)), format_sar(sports_total)])

    sports_table = Table(sports_rows, colWidths=[150, 120, 80, 100, 80, 100])
    sports_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SERA_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), SERA_GREEN),
        ('TEXTCOLOR', (0, -1), (-1, -1), WHITE),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 1.5, SERA_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    elements.append(sports_table)
    elements.append(Spacer(1, 20))

    # Newsletters
    news_data = [
        ['52 WEEKLY NEWSLETTERS', '', '', ''],
        ['Item', 'Subtotal (SAR)', 'Commission (15%)', 'Total (SAR)'],
        ['Content Writing (AR/EN), Design, Distribution, Print', format_sar(newsletters['subtotal']),
         format_sar(newsletters['commission']), format_sar(newsletters['total'])],
    ]

    news_table = Table(news_data, colWidths=[280, 120, 120, 110])
    news_table.setStyle(TableStyle([
        ('SPAN', (0, 0), (-1, 0)),
        ('BACKGROUND', (0, 0), (-1, 0), SERA_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BACKGROUND', (0, 1), (-1, 1), SERA_GREEN),
        ('TEXTCOLOR', (0, 1), (-1, 1), WHITE),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 1.5, SERA_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))

    elements.append(news_table)
    elements.append(Spacer(1, 30))

    # GRAND TOTAL BOX
    elements.append(Paragraph("FINAL BUDGET SUMMARY", section_style))

    final_data = [
        ['SERA 2026 COMPLETE BUDGET', '', ''],
        ['Category', 'Amount (SAR)', ''],
        ['All Events (41)', format_sar(events_total), ''],
        ['Sports (3)', format_sar(sports_total), ''],
        ['Newsletters (52)', format_sar(newsletters['total']), ''],
        ['', '', ''],
        ['GRAND TOTAL (Excluding VAT)', format_sar(grand_total_ex_vat), ''],
        ['VAT (15%)', format_sar(vat), ''],
        ['', '', ''],
        ['★ GRAND TOTAL (Including VAT)', format_sar(grand_total_inc_vat), ''],
    ]

    final_table = Table(final_data, colWidths=[250, 150, 50])
    final_table.setStyle(TableStyle([
        # Title
        ('SPAN', (0, 0), (-1, 0)),
        ('BACKGROUND', (0, 0), (-1, 0), SERA_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),

        # Header
        ('BACKGROUND', (0, 1), (-1, 1), SERA_BLUE),
        ('TEXTCOLOR', (0, 1), (-1, 1), WHITE),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),

        # Grand total ex-VAT
        ('BACKGROUND', (0, 6), (-1, 6), SERA_GREEN),
        ('TEXTCOLOR', (0, 6), (-1, 6), WHITE),
        ('FONTNAME', (0, 6), (-1, 6), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 6), (-1, 6), 11),

        # Final total
        ('BACKGROUND', (0, 9), (-1, 9), SERA_DARK),
        ('TEXTCOLOR', (0, 9), (-1, 9), colors.HexColor('#FFD700')),
        ('FONTNAME', (0, 9), (-1, 9), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 9), (-1, 9), 14),

        # Alignment
        ('ALIGN', (1, 1), (1, -1), 'RIGHT'),

        # Borders
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOX', (0, 0), (-1, -1), 3, SERA_DARK),

        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))

    elements.append(final_table)

    # Build PDF
    doc.build(elements, onFirstPage=create_header_footer, onLaterPages=create_header_footer)
    print(f"PDF saved to: {output_path}")


def generate_csv(output_path):
    """Generate comprehensive CSV file"""

    with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)

        # Header
        writer.writerow(['SERA 2026 - FINANCIAL OVERVIEW'])
        writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M')])
        writer.writerow([])

        # Executive Summary
        writer.writerow(['=== EXECUTIVE SUMMARY ==='])
        writer.writerow(['Category', 'Count', 'Budget (SAR)', 'Percentage'])

        q1_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q1')
        q2_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q2')
        q3_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q3')
        q4_total = sum(e['total'] for e in events_data if e['quarter'] == 'Q4')
        events_total = sum(e['total'] for e in events_data)
        sports_total = sum(s['total'] for s in sports_data)
        grand_total = events_total + sports_total + newsletters['total']

        writer.writerow(['Q1 Events', 9, q1_total, f"{q1_total/grand_total*100:.1f}%"])
        writer.writerow(['Q2 Events', 8, q2_total, f"{q2_total/grand_total*100:.1f}%"])
        writer.writerow(['Q3 Events', 8, q3_total, f"{q3_total/grand_total*100:.1f}%"])
        writer.writerow(['Q4 Events', 16, q4_total, f"{q4_total/grand_total*100:.1f}%"])
        writer.writerow(['Sports', 3, sports_total, f"{sports_total/grand_total*100:.1f}%"])
        writer.writerow(['Newsletters', 52, newsletters['total'], f"{newsletters['total']/grand_total*100:.1f}%"])
        writer.writerow([])
        writer.writerow(['GRAND TOTAL (ex-VAT)', '', grand_total, '100%'])
        writer.writerow(['VAT (15%)', '', grand_total * 0.15, ''])
        writer.writerow(['GRAND TOTAL (inc-VAT)', '', grand_total * 1.15, ''])
        writer.writerow([])
        writer.writerow([])

        # All Events Detail
        writer.writerow(['=== ALL EVENTS DETAIL ==='])
        writer.writerow(['#', 'Event Name (EN)', 'Event Name (AR)', 'Date', 'Quarter', 'Category',
                        'Attendance', 'Tier', 'Subtotal (SAR)', 'Commission (SAR)', 'Total (SAR)'])

        for e in events_data:
            writer.writerow([
                e['num'], e['name_en'], e['name_ar'], e['date'], e['quarter'],
                e['category'], e['attendance'], e['tier'],
                e['subtotal'], e['commission'], e['total']
            ])

        writer.writerow([])
        writer.writerow(['', 'ALL EVENTS TOTAL', '', '', '', '', '', '',
                        sum(e['subtotal'] for e in events_data),
                        sum(e['commission'] for e in events_data),
                        events_total])

        writer.writerow([])
        writer.writerow([])

        # Sports
        writer.writerow(['=== SPORTS EVENTS ==='])
        writer.writerow(['Sport (EN)', 'Sport (AR)', 'Participants', 'Subtotal (SAR)', 'Commission (SAR)', 'Total (SAR)'])
        for s in sports_data:
            writer.writerow([s['name_en'], s['name_ar'], s['participants'], s['subtotal'], s['commission'], s['total']])
        writer.writerow(['SPORTS TOTAL', '', '', sum(s['subtotal'] for s in sports_data),
                        sum(s['commission'] for s in sports_data), sports_total])

        writer.writerow([])
        writer.writerow([])

        # Newsletters
        writer.writerow(['=== NEWSLETTERS ==='])
        writer.writerow(['Item', 'Issues', 'Subtotal (SAR)', 'Commission (SAR)', 'Total (SAR)'])
        writer.writerow(['52 Weekly Newsletters', 52, newsletters['subtotal'], newsletters['commission'], newsletters['total']])

    print(f"CSV saved to: {output_path}")


if __name__ == "__main__":
    output_dir = "/home/user/dns"

    pdf_path = os.path.join(output_dir, "SERA_2026_Financial_Overview.pdf")
    csv_path = os.path.join(output_dir, "SERA_2026_Financial_Overview.csv")

    generate_pdf(pdf_path)
    generate_csv(csv_path)

    print("\n✓ Generation complete!")
    print(f"  PDF: {pdf_path}")
    print(f"  CSV: {csv_path}")
