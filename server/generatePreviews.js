import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { emailService } from './services/emailService.js';
import { EMAIL_TEMPLATES } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../public/email-previews');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const mockBooking = {
  id: 'la-8f3a92b10',
  guest_name: 'Sophia Montgomery',
  guest_email: 'sophia.montgomery@example.com',
  guest_phone: '+254 712 345 678',
  unit_id: 'skyview',
  check_in: '2026-10-18',
  check_out: '2026-10-23',
  total_price: 45000,
  secure_token: 'demo-secure-token-9988',
  passcode: '8492',
  wifi_ssid: 'Skyview_HighSpeed_5G',
  wifi_password: 'LuxuryEstate2026!'
};

console.log('Generating email preview files into:', outputDir);

// 1. Welcome Email (Image 3 Design)
const welcomeHtml = emailService._renderWelcomeExperienceEmail({
  title: 'Experience luxury at Lulu Aurelian Estate!',
  preheader: 'Discover Lulu Aurelian Estate, where luxury meets serene comfort.',
  guestName: 'Sophia Montgomery',
  ctaUrl: 'https://www.luluaurelian.co.ke/#/units'
});
fs.writeFileSync(path.join(outputDir, 'welcome.html'), welcomeHtml, 'utf8');

// 2. Review Request Email (Image 1 Design)
const reviewHtml = emailService._renderReviewRequestEmail(mockBooking);
fs.writeFileSync(path.join(outputDir, 'review.html'), reviewHtml, 'utf8');

// 3. Cancellation Email (Image 2 Design)
const cancelHtml = emailService._renderCancellationEmail(mockBooking);
fs.writeFileSync(path.join(outputDir, 'cancellation.html'), cancelHtml, 'utf8');

// 4. Payment Success Confirmation
const paymentData = EMAIL_TEMPLATES.PAYMENT_SUCCESS_CONFIRMATION(mockBooking);
const paymentBody =
  emailService._renderBadge(paymentData.badge) +
  emailService._renderHeading(paymentData.headingLine1, paymentData.headingLine2) +
  emailService._renderParagraphs(paymentData.paragraphs) +
  emailService._renderAlertBox(paymentData.alertText) +
  emailService._renderLocationBlock(mockBooking.unit_id) +
  emailService._renderBookingRef(paymentData.bookingRef) +
  emailService._renderButton(paymentData.button);
const paymentHtml = emailService._getHtmlTemplate(paymentData.title, paymentData.preheader, paymentBody, paymentData.heroImage);
fs.writeFileSync(path.join(outputDir, 'payment-confirmation.html'), paymentHtml, 'utf8');

// 5. Booking Confirmation (Awaiting Payment)
const bookingData = EMAIL_TEMPLATES.BOOKING_CONFIRMATION(mockBooking);
const bookingBody =
  emailService._renderBadge(bookingData.badge) +
  emailService._renderHeading(bookingData.headingLine1, bookingData.headingLine2) +
  emailService._renderParagraphs(bookingData.paragraphs) +
  emailService._renderAlertBox(bookingData.alertText) +
  emailService._renderLocationBlock(mockBooking.unit_id) +
  emailService._renderBookingRef(bookingData.bookingRef) +
  emailService._renderButton(bookingData.button);
const bookingHtml = emailService._getHtmlTemplate(bookingData.title, bookingData.preheader, bookingBody, bookingData.heroImage);
fs.writeFileSync(path.join(outputDir, 'booking-confirmation.html'), bookingHtml, 'utf8');

// 6. Fulfillment Check-in Credentials Pass
const fulfillmentData = EMAIL_TEMPLATES.FULFILLMENT_CREDENTIALS(mockBooking);
const fulfillmentBody =
  emailService._renderBadge(fulfillmentData.badge) +
  emailService._renderHeading(fulfillmentData.headingLine1, fulfillmentData.headingLine2) +
  emailService._renderParagraphs(fulfillmentData.paragraphs) +
  emailService._renderLocationBlock(mockBooking.unit_id) +
  emailService._renderCredentialsBox(fulfillmentData.credentials) +
  emailService._renderRulesList(fulfillmentData.rules) +
  emailService._renderContactCards() +
  emailService._renderBookingRef(fulfillmentData.bookingRef) +
  emailService._renderButton(fulfillmentData.button);
const fulfillmentHtml = emailService._getHtmlTemplate(fulfillmentData.title, fulfillmentData.preheader, fulfillmentBody, fulfillmentData.heroImage);
fs.writeFileSync(path.join(outputDir, 'checkin-pass.html'), fulfillmentHtml, 'utf8');

// 7. Interactive Preview Gallery Dashboard (index.html)
const galleryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lulu Aurelian Estate · Email Templates Preview Gallery</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: #12100D;
      color: #FAF9F6;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background-color: #1D1912;
      border-bottom: 1px solid rgba(207, 168, 115, 0.25);
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-crest {
      width: 32px;
      height: 40px;
      border: 1.5px solid #cfa873;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 700;
      color: #cfa873;
      font-size: 13px;
    }
    .brand-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #FAF9F6;
    }
    .brand-subtitle {
      font-size: 10px;
      color: #cfa873;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .nav-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #C5C0B8;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tab-btn:hover {
      background: rgba(207, 168, 115, 0.15);
      color: #FAF9F6;
      border-color: rgba(207, 168, 115, 0.4);
    }
    .tab-btn.active {
      background: #cfa873;
      color: #1D1912;
      border-color: #cfa873;
      box-shadow: 0 4px 12px rgba(207, 168, 115, 0.3);
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .view-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FAF9F6;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .view-btn.active {
      border-color: #cfa873;
      color: #cfa873;
      background: rgba(207, 168, 115, 0.1);
    }
    .open-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #cfa873;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .open-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .preview-container {
      flex: 1;
      background-color: #25221C;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 24px 16px;
      overflow-y: auto;
    }
    .preview-frame-wrapper {
      background: #FFFFFF;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      border-radius: 20px;
      overflow: hidden;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      width: 660px;
      height: 92vh;
    }
    .preview-frame-wrapper.mobile {
      width: 390px;
      border-radius: 36px;
      border: 6px solid #1D1912;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background-color: #FAF9F6;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-crest">LA</div>
      <div>
        <div class="brand-title">Lulu Aurelian</div>
        <div class="brand-subtitle">Email Preview Gallery</div>
      </div>
    </div>

    <div class="nav-tabs">
      <button class="tab-btn active" onclick="loadEmail('welcome.html', this)">
        <span>✨</span> Welcome (Image 3)
      </button>
      <button class="tab-btn" onclick="loadEmail('review.html', this)">
        <span>⭐</span> Review Survey (Image 1)
      </button>
      <button class="tab-btn" onclick="loadEmail('cancellation.html', this)">
        <span>🚫</span> Cancellation (Image 2)
      </button>
      <button class="tab-btn" onclick="loadEmail('payment-confirmation.html', this)">
        <span>💳</span> Payment Confirmed
      </button>
      <button class="tab-btn" onclick="loadEmail('checkin-pass.html', this)">
        <span>🔑</span> Check-in Access Pass
      </button>
      <button class="tab-btn" onclick="loadEmail('booking-confirmation.html', this)">
        <span>🛎️</span> Booking Request
      </button>
    </div>

    <div class="controls">
      <button class="view-btn active" id="btnDesktop" onclick="setMode('desktop')">Desktop (660px)</button>
      <button class="view-btn" id="btnMobile" onclick="setMode('mobile')">Mobile (390px)</button>
      <a class="open-btn" id="openExternal" href="welcome.html" target="_blank">Open Tab ↗</a>
    </div>
  </header>

  <div class="preview-container">
    <div class="preview-frame-wrapper" id="frameWrapper">
      <iframe id="previewIframe" src="welcome.html"></iframe>
    </div>
  </div>

  <script>
    let currentEmail = 'welcome.html';

    function loadEmail(file, btn) {
      currentEmail = file;
      document.getElementById('previewIframe').src = file;
      document.getElementById('openExternal').href = file;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function setMode(mode) {
      const wrapper = document.getElementById('frameWrapper');
      const btnDesk = document.getElementById('btnDesktop');
      const btnMob = document.getElementById('btnMobile');

      if (mode === 'mobile') {
        wrapper.classList.add('mobile');
        btnMob.classList.add('active');
        btnDesk.classList.remove('active');
      } else {
        wrapper.classList.remove('mobile');
        btnDesk.classList.add('active');
        btnMob.classList.remove('active');
      }
    }
  </script>

</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'index.html'), galleryHtml, 'utf8');

console.log('Successfully generated all email preview files!');
