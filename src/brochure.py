import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# ==============================================================================
# LULU AURELIAN ESTATE — LUXURY GUEST WELCOME GUIDE & HOUSE MANUAL
# ==============================================================================

# Design System Color Tokens (matching src/index.css & master.md)
COLOR_DARK = colors.HexColor("#1D1912")        # Deep Obsidian Charcoal
COLOR_GOLD_DEEP = colors.HexColor("#9E6C15")   # Rich Amber Gold
COLOR_GOLD_MUTED = colors.HexColor("#D2A63C")  # Muted Gold
COLOR_GOLD_BRIGHT = colors.HexColor("#EECD5C") # Bright Gold
COLOR_BG_CREAM = colors.HexColor("#F3F3E6")    # Soft Alabaster Cream
COLOR_ROW_TINT = colors.HexColor("#FAF8F4")    # Warm Off-White Tint
COLOR_BORDER = colors.HexColor("#E2DACF")      # Refined Warm Border
COLOR_TEXT = colors.HexColor("#221C16")        # Rich Charcoal Text
COLOR_TEXT_MUTED = colors.HexColor("#6B655B")  # Warm Grey Muted
COLOR_WHITE = colors.HexColor("#FFFFFF")       # Pure White


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas that computes total page count and applies elegant running
    headers, gold divider rules, and 'Page X of Y' footers across all pages.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        # Top hairline gold rule
        self.setStrokeColor(COLOR_GOLD_MUTED)
        self.setLineWidth(0.6)
        self.line(36, self._pagesize[1] - 22, self._pagesize[0] - 36, self._pagesize[1] - 22)

        # Bottom hairline gold rule
        self.setLineWidth(0.4)
        self.line(36, 30, self._pagesize[0] - 36, 30)

        # Bottom running footer
        self.setFont('Helvetica', 7.5)
        self.setFillColor(COLOR_TEXT_MUTED)
        footer_brand = "Lulu Aurelian Estate • Skyline Lifestyle Apartments, Nyeri, Kenya • Direct Portal: www.luluaurelian.co.ke"
        self.drawString(36, 18, footer_brand)
        self.drawRightString(self._pagesize[0] - 36, 18, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()


def create_welcome_guide(output_filename="Lulu_Aurelian_Welcome_Guide.pdf"):
    # Path resolution
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, ".."))
    logo_path = os.path.join(project_root, "public", "apple-touch-icon.png")

    # Document Template
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=32,
        bottomMargin=36,
        title="Lulu Aurelian Estate — Luxury Guest Welcome Guide",
        author="Lulu Aurelian Estate"
    )

    styles = getSampleStyleSheet()

    # Paragraph Styles
    title_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=COLOR_DARK,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'BrandSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13,
        textColor=COLOR_GOLD_DEEP,
        spaceAfter=2
    )

    meta_style = ParagraphStyle(
        'BrandMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=COLOR_TEXT_MUTED
    )

    page2_header_style = ParagraphStyle(
        'Page2Header',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=COLOR_DARK
    )

    page2_sub_style = ParagraphStyle(
        'Page2Sub',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=COLOR_GOLD_DEEP
    )

    section_banner_style = ParagraphStyle(
        'SectionBanner',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=COLOR_WHITE
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.3,
        leading=11.5,
        textColor=COLOR_TEXT,
        spaceAfter=2.5
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2.5
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=COLOR_WHITE
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=body_style,
        fontSize=7.8,
        leading=10.5,
        spaceAfter=0
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=COLOR_DARK
    )

    footnote_style = ParagraphStyle(
        'FootnoteCustom',
        parent=body_style,
        fontSize=7.2,
        leading=9.5,
        alignment=1,
        textColor=COLOR_TEXT_MUTED
    )

    # Section Banner Table Builder
    def create_section_header(title_text):
        data = [[Paragraph(f"<b>{title_text.upper()}</b>", section_banner_style)]]
        t = Table(data, colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), COLOR_DARK),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('LINELEFT', (0, 0), (0, -1), 3, COLOR_GOLD_BRIGHT),
        ]))
        return t

    elements = []

    # ==========================================================================
    # PAGE 1: BRAND IDENTITY, ARRIVAL, SUITES DIRECTORY & HOUSE GUIDELINES
    # ==========================================================================

    # Header with Emblem Logo
    if os.path.exists(logo_path):
        logo_img = Image(logo_path, width=42, height=42)
        brand_text = [
            Paragraph("<b>LULU AURELIAN ESTATE</b>", title_style),
            Paragraph("<i>Refined Elegance, Uncompromised Comfort — Guest Welcome Guide</i>", subtitle_style),
            Paragraph("Skyline Lifestyle Apartments • Nyeri, Kenya • Concierge: +254 112 299 384", meta_style)
        ]
        header_table = Table([[logo_img, brand_text]], colWidths=[48, 492])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(header_table)
    else:
        elements.append(Paragraph("<b>LULU AURELIAN ESTATE</b>", title_style))
        elements.append(Paragraph("<i>Refined Elegance, Uncompromised Comfort — Guest Welcome Guide</i>", subtitle_style))
        elements.append(Paragraph("Skyline Lifestyle Apartments, Nyeri, Kenya • Concierge: +254 112 299 384", meta_style))

    elements.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_GOLD_DEEP, spaceBefore=4, spaceAfter=7))

    # Section 1: Arrival & Contactless Check-In
    elements.append(create_section_header("1. Arrival & Contactless Check-In"))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("• <b>Prime Location:</b> Skyline Lifestyle Apartments, off Nyeri–Nairobi Highway (next to former Rubis Petrol Station), Skuta, Nyeri County.", bullet_style))
    elements.append(Paragraph("• <b>Contactless Self-Check-In:</b> Check-in begins at <b>2:00 PM (14:00 EAT)</b>. Secure keyless lockboxes are positioned right outside each apartment door. Your private access code is dispatched automatically upon booking confirmation.", bullet_style))
    elements.append(Paragraph("• <b>Check-Out Timing:</b> Check-out is strictly before <b>10:00 AM EAT</b> to ensure our housekeeping team maintains immaculate hygiene and sanitation for arriving guests.", bullet_style))
    elements.append(Paragraph("• <b>Secure Gated Parking:</b> Complimentary covered parking is provided inside the gated perimeter with 24/7 dedicated security personnel.", bullet_style))
    elements.append(Spacer(1, 5))

    # Section 2: Suite Directory & High-Speed Wi-Fi
    elements.append(create_section_header("2. Suite Directory & High-Speed Wi-Fi"))
    elements.append(Spacer(1, 3))

    suites_data = [
        [
            Paragraph("<b>Suite Name</b>", table_header_style),
            Paragraph("<b>Apartment</b>", table_header_style),
            Paragraph("<b>Wi-Fi Network (SSID)</b>", table_header_style),
            Paragraph("<b>Wi-Fi Password</b>", table_header_style),
            Paragraph("<b>Suite Highlights & Layout</b>", table_header_style)
        ],
        [
            Paragraph("<b>Skyview Hideaway</b>", table_cell_bold),
            Paragraph("Suite 16<br/>(Top Penthouse)", table_cell_style),
            Paragraph("Pearl_16", table_cell_style),
            Paragraph("PearlSL_16", table_cell_bold),
            Paragraph("270° Mt. Kenya panoramas, private balcony, workspace, 2 King beds", table_cell_style)
        ],
        [
            Paragraph("<b>Cocoa Retreat</b>", table_cell_bold),
            Paragraph("Suite 19<br/>(First Floor)", table_cell_style),
            Paragraph("MK_Ny-0", table_cell_style),
            Paragraph("CMutwiri<br/><i>(Ext: Bedroom / CMutwiri)</i>", table_cell_bold),
            Paragraph("Warm cocoa-toned aesthetics, pine forest views, 2 Queen beds", table_cell_style)
        ],
        [
            Paragraph("<b>Neema Haven</b>", table_cell_bold),
            Paragraph("Suite SL-2<br/>(First Floor)", table_cell_style),
            Paragraph("AURELIAN", table_cell_style),
            Paragraph("Lulu_26#", table_cell_bold),
            Paragraph("Serene sunset retreat, airy minimalist luxury, 2 Queen beds", table_cell_style)
        ]
    ]

    suites_table = Table(suites_data, colWidths=[92, 75, 85, 95, 193])
    suites_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), COLOR_WHITE),
        ('BACKGROUND', (0, 1), (-1, 1), COLOR_ROW_TINT),
        ('BACKGROUND', (0, 2), (-1, 2), COLOR_WHITE),
        ('BACKGROUND', (0, 3), (-1, 3), COLOR_ROW_TINT),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(suites_table)
    elements.append(Spacer(1, 5))

    # Section 3: Suite Amenities & House Guidelines
    elements.append(create_section_header("3. Suite Amenities & Stay Guidelines"))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("• <b>Full Culinary Kitchen:</b> Equipped with refrigerator, microwave, electric cooker, cookware, dining dinnerware, and electric kettle.", bullet_style))
    elements.append(Paragraph("• <b>Strict Non-Smoking Policy:</b> Indoor smoking or vaping is strictly prohibited. Guests may smoke exclusively on the open balcony with provided ashtrays.", bullet_style))
    elements.append(Paragraph("• <b>Quiet Hours (10:00 PM – 7:00 AM):</b> To preserve tranquility for all residents, kindly maintain peaceful noise levels during evening hours.", bullet_style))
    elements.append(Paragraph("• <b>Towel & Cleanliness Protocol:</b> Towels are provided strictly for personal hygiene (not for footwear or cleaning spills). Please wash used dishes prior to departure.", bullet_style))
    elements.append(Paragraph("• <b>Balcony & Living Plants:</b> Supervise children on balconies at all times. Do not water or relocate indoor live plants. Washing machine on the top-floor second balcony requires express host permission.", bullet_style))

    # Clean Break to Page 2
    elements.append(PageBreak())

    # ==========================================================================
    # PAGE 2: LOCAL DINING, HIGHLAND ADVENTURES & CONCIERGE DIRECTORY
    # ==========================================================================

    # Page 2 Top Banner
    p2_header = Table([
        [
            Paragraph("<b>LULU AURELIAN ESTATE &bull; GUEST COMPENDIUM</b>", page2_header_style),
            Paragraph("<i>Curated Nyeri Guide & Host Concierge Directory</i>", page2_sub_style)
        ]
    ], colWidths=[310, 230])
    p2_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(p2_header)
    elements.append(HRFlowable(width="100%", thickness=1.0, color=COLOR_GOLD_DEEP, spaceBefore=3, spaceAfter=7))

    # Section 4: Curated Local Dining & Artisanal Cafes
    elements.append(create_section_header("4. Curated Local Dining & Artisanal Cafes"))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("• <b>The Vatican Grill Nyeri (Kenyatta Rd):</b> Premier culinary destination for sizzling flame-grilled meats, panoramic town vistas, and evening ambiance.", bullet_style))
    elements.append(Paragraph("• <b>Raybells Restaurant (Town Center):</b> Celebrated for authentic, freshly prepared Kenyan classics, hearty rich stews, and traditional specialties.", bullet_style))
    elements.append(Paragraph("• <b>Kash Kitchen:</b> Best town hotspot for gourmet smash burgers, loaded fries, crisp chicken platters, and specialty milkshakes.", bullet_style))
    elements.append(Paragraph("• <b>To Go Is To See:</b> Beloved authentic local hidden gem renowned across Nyeri for succulent, slow-roasted juicy chicken.", bullet_style))
    elements.append(Paragraph("• <b>The White Rhino & Outspan Hotels:</b> Colonial heritage afternoon high tea, lush manicured botanical gardens, and refined fine dining.", bullet_style))
    elements.append(Spacer(1, 5))

    # Section 5: Highland Excursions & Shopping Basecamp
    elements.append(create_section_header("5. Highland Excursions & Shopping Basecamp"))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("• <b>Mount Kenya National Park:</b> World Heritage mountain basecamp. Narromoru and Sirimon climbing trails are easily accessible from Nyeri.", bullet_style))
    elements.append(Paragraph("• <b>Aberdare National Park:</b> Mist-draped alpine bamboo forests, deep valleys, and breathtaking waterfalls including Karuru and Chania Falls.", bullet_style))
    elements.append(Paragraph("• <b>Lord Baden-Powell Historic Grounds:</b> Paxtu Museum and the legendary Scouting founder’s final resting site within a short taxi ride.", bullet_style))
    elements.append(Paragraph("• <b>Chaka Ranch Leisure Park:</b> Premier highland outdoor arena offering quad biking, obstacle race courses, and family activities.", bullet_style))
    elements.append(Paragraph("• <b>Nyeri Mall (Naivas Supermarket):</b> Full-service modern shopping center to stock up on groceries, farm-fresh produce, pharmacy, and trekking provisions.", bullet_style))
    elements.append(Spacer(1, 5))

    # Section 6: Concierge & Emergency Directory
    elements.append(create_section_header("6. Concierge & Emergency Directory"))
    elements.append(Spacer(1, 3))

    contacts_data = [
        [
            Paragraph("<b>Service / Authority</b>", table_header_style),
            Paragraph("<b>Contact Details</b>", table_header_style),
            Paragraph("<b>Hours & Availability</b>", table_header_style)
        ],
        [
            Paragraph("<b>Host Concierge (Safaricom / WhatsApp)</b>", table_cell_bold),
            Paragraph("+254 112 299 384", table_cell_style),
            Paragraph("24/7 Guest Assistance & Fast Response", table_cell_style)
        ],
        [
            Paragraph("<b>Secondary Host Support (Airtel)</b>", table_cell_bold),
            Paragraph("+254 756 958 531", table_cell_style),
            Paragraph("Direct Voice & Text Communication", table_cell_style)
        ],
        [
            Paragraph("<b>Email Concierge</b>", table_cell_bold),
            Paragraph("pearlisprime@gmail.com", table_cell_style),
            Paragraph("Extended Stays, Billing & General Inquiries", table_cell_style)
        ],
        [
            Paragraph("<b>Nyeri Central Police Station</b>", table_cell_bold),
            Paragraph("+254 61 2030800 &nbsp;|&nbsp; 999 / 112", table_cell_style),
            Paragraph("24/7 Local Police & Public Safety", table_cell_style)
        ],
        [
            Paragraph("<b>Outspan Hospital (Private 24/7)</b>", table_cell_bold),
            Paragraph("+254 712 121 212 &nbsp;|&nbsp; +254 61 2030230", table_cell_style),
            Paragraph("24/7 Full Emergency & Ambulance Dispatch", table_cell_style)
        ],
        [
            Paragraph("<b>Nyeri County Referral Hospital</b>", table_cell_bold),
            Paragraph("+254 61 2030500", table_cell_style),
            Paragraph("24/7 Level 5 Referral Healthcare", table_cell_style)
        ]
    ]

    contacts_table = Table(contacts_data, colWidths=[185, 175, 180])
    contacts_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), COLOR_WHITE),
        ('BACKGROUND', (0, 1), (-1, 1), COLOR_ROW_TINT),
        ('BACKGROUND', (0, 2), (-1, 2), COLOR_WHITE),
        ('BACKGROUND', (0, 3), (-1, 3), COLOR_ROW_TINT),
        ('BACKGROUND', (0, 4), (-1, 4), COLOR_WHITE),
        ('BACKGROUND', (0, 5), (-1, 5), COLOR_ROW_TINT),
        ('BACKGROUND', (0, 6), (-1, 6), COLOR_WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(contacts_table)

    # Closing Note & Disclaimer
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=0.8, color=COLOR_GOLD_MUTED, spaceBefore=2, spaceAfter=5))
    elements.append(Paragraph("<i>Thank you for choosing Lulu Aurelian Estate. We wish you an inspiring, peaceful, and memorable stay. Karibu Sana!</i>", ParagraphStyle('Signoff', parent=body_style, alignment=1, fontSize=8.5, textColor=COLOR_DARK)))
    elements.append(Spacer(1, 2))
    elements.append(Paragraph("This digital guide is provided for guest convenience. For direct reservations and suite policies, visit www.luluaurelian.co.ke", footnote_style))

    # Build Document with NumberedCanvas
    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {output_filename}")

    # Synchronize legacy/companion filename
    legacy_filename = "Nyeri_Welcome_Guide.pdf"
    if output_filename != legacy_filename:
        try:
            shutil.copyfile(output_filename, legacy_filename)
            print(f"Synchronized copy created: {legacy_filename}")
        except Exception as e:
            print(f"Notice: Could not copy to legacy filename: {e}")

if __name__ == "__main__":
    create_welcome_guide()