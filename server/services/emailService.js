import { env } from '../config/env.js';
import { EMAIL_TEMPLATES, UNIT_WELCOME_DETAILS, formatDateEAT } from '../config/constants.js';
import { db } from '../config/db.js';

class EmailService {
  constructor() {
    // Using Resend API (HTTP Port 443), bypassing Railway SMTP blocks.
  }

  // ==========================================
  // HTML STYLING COMPONENT BUILDERS
  // ==========================================

  // ==========================================
  // LUXURY BRAND EMAIL COMPONENT BUILDERS
  // ==========================================

  /**
   * Renders the iconic brand crest header matching Haven Hotels / Lulu Aurelian luxury theme.
   */
  _renderBrandHeader() {
    return `
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto; padding: 24px 20px 16px 20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td align="center" style="width: 44px; height: 54px; border: 1.5px solid #1D1912; border-radius: 22px; text-align: center; vertical-align: middle; background-color: #FAF9F6;">
                  <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; font-weight: 700; color: #cfa873; letter-spacing: 1.5px; display: block; line-height: 1;">LA</span>
                </td>
              </tr>
            </table>
            <div style="margin-top: 10px; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3.5px; color: #1D1912; text-transform: uppercase;">
              LULU AURELIAN
            </div>
            <div style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 2.5px; color: #cfa873; text-transform: uppercase; margin-top: 3px;">
              ESTATE
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Renders the dark footer matching the reference design.
   */
  _renderBrandFooter({ unsubscribeUrl = null } = {}) {
    const unsubHtml = unsubscribeUrl ? `
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #777777;">
        Do you no longer want to receive these emails? <a href="${unsubscribeUrl}" style="color: #cfa873; text-decoration: underline;">Unsubscribe</a>
      </p>
    ` : '';

    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1D1912; color: #FFFFFF; border-radius: 0 0 24px 24px; text-align: center;">
        <tr>
          <td align="center" style="padding: 38px 24px 34px 24px;">
            <!-- Footer Crest Badge -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom: 12px;">
              <tr>
                <td align="center" style="width: 36px; height: 46px; border: 1.5px solid #cfa873; border-radius: 18px; text-align: center; vertical-align: middle;">
                  <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14px; font-weight: 700; color: #cfa873; letter-spacing: 1px; display: block;">LA</span>
                </td>
              </tr>
            </table>
            <div style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #FFFFFF; text-transform: uppercase; margin-bottom: 18px;">
              LULU AURELIAN ESTATE
            </div>

            <!-- Social Links -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 20px auto;">
              <tr>
                <td style="padding: 0 8px;">
                  <a href="https://wa.me/254112299384" target="_blank" style="text-decoration: none;">
                    <img src="https://img.icons8.com/ios/50/cfa873/whatsapp.png" alt="WhatsApp" width="22" height="22" style="display: block; border: 0;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="https://www.instagram.com/luluaurelian?igsh=MWE3cnk5bmdieXc0ag==" target="_blank" style="text-decoration: none;">
                    <img src="https://img.icons8.com/ios/50/cfa873/instagram-new.png" alt="Instagram" width="22" height="22" style="display: block; border: 0;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="https://www.facebook.com/share/1EY74Cxf23/" target="_blank" style="text-decoration: none;">
                    <img src="https://img.icons8.com/ios/50/cfa873/facebook-new.png" alt="Facebook" width="22" height="22" style="display: block; border: 0;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="https://www.tiktok.com/@luluaurelian?_r=1&_t=ZS-97lvlocMx1d" target="_blank" style="text-decoration: none;">
                    <img src="https://img.icons8.com/ios/50/cfa873/tiktok.png" alt="TikTok" width="22" height="22" style="display: block; border: 0;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="https://www.airbnb.com/h/pearlapartmentsnyeri" target="_blank" style="text-decoration: none;">
                    <img src="https://img.icons8.com/ios/50/cfa873/airbnb.png" alt="Airbnb" width="22" height="22" style="display: block; border: 0;" />
                  </a>
                </td>
                <td style="padding: 0 8px;">
                  <a href="https://www.booking.com/Share-F7S7E5V" target="_blank" style="text-decoration: none;">
                    <img src="https://img.icons8.com/ios/50/cfa873/booking.png" alt="Booking.com" width="22" height="22" style="display: block; border: 0;" />
                  </a>
                </td>
              </tr>
            </table>

            <!-- Copyright -->
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #A0A0A0; font-family: 'Montserrat', sans-serif; letter-spacing: 0.5px;">
              © 2026 Lulu Aurelian Estate. Skyline Apartments, Nyeri, Kenya.
            </p>

            <!-- Nav Links -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
              <tr>
                <td style="padding: 0 8px;"><a href="https://www.luluaurelian.co.ke" style="color: #cfa873; font-size: 11px; text-decoration: none; font-weight: 500;">About Us</a></td>
                <td style="color: #555555; font-size: 11px;">|</td>
                <td style="padding: 0 8px;"><a href="https://www.luluaurelian.co.ke/#/portal" style="color: #cfa873; font-size: 11px; text-decoration: none; font-weight: 500;">Privacy Policy</a></td>
                <td style="color: #555555; font-size: 11px;">|</td>
                <td style="padding: 0 8px;"><a href="https://wa.me/254112299384" style="color: #cfa873; font-size: 11px; text-decoration: none; font-weight: 500;">Support</a></td>
              </tr>
            </table>
            ${unsubHtml}
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Dedicated Welcome Experience Email Builder matching Image 3 (Experience luxury at Haven/Lulu Aurelian Hotels).
   * Features:
   * - Centered Brand Crest header
   * - Luxury heading & subtitle
   * - 2x2 photo collage grid
   * - "Take me there ->" pill button
   * - "Whether for business or leisure, enjoy!" section with 3 alternating feature rows
   * - Soft Mint/Cream promotional card with perks (Discounts & Perks, High Speed Internet, Free Refreshments)
   * - Dark footer with social icons
   */
  _renderWelcomeExperienceEmail({
    title = 'Experience luxury at Lulu Aurelian Estate!',
    preheader = 'Discover Lulu Aurelian Estate, where luxury meets serene comfort.',
    guestName = null,
    ctaUrl = 'https://www.luluaurelian.co.ke/#/units'
  } = {}) {
    const greetingSubtitle = guestName
      ? `Dear ${guestName}, discover Lulu Aurelian Estate, where luxury meets comfort. Enjoy key features like panoramic mountain views, spacious designer suites, and world-class hospitality for an unforgettable stay.`
      : `Discover Lulu Aurelian Estate, where luxury meets comfort. Enjoy key features like panoramic mountain views, spacious designer suites, and world-class hospitality for an unforgettable stay.`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body, p, a, td, span, strong, ul, li, div { font-family: 'Montserrat', Helvetica, Arial, sans-serif !important; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Cormorant Garamond', Georgia, serif !important; }
        @media only screen and (max-width: 620px) {
          .email-container { width: 100% !important; }
          .feature-col-img { width: 100px !important; }
          .feature-col-img img { width: 100px !important; height: 100px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-font-smoothing: antialiased;">
      <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
        ${preheader}
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF9F6; padding: 30px 15px;">
        <tr>
          <td align="center">
            
            <table class="email-container" width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 28px; overflow: hidden; box-shadow: 0 15px 35px rgba(29,25,18,0.06); max-width: 600px; width: 100%; border: 1px solid #EFECE6;">
              
              <!-- Brand Header with Centered Crest -->
              <tr>
                <td align="center" style="padding-top: 10px;">
                  ${this._renderBrandHeader()}
                </td>
              </tr>

              <!-- Hero Headline Section -->
              <tr>
                <td align="center" style="padding: 0 28px 24px 28px;">
                  <h1 style="margin: 0 0 14px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 30px; line-height: 1.25; font-weight: 700; color: #1D1912; letter-spacing: -0.5px;">
                    Experience luxury at Lulu Aurelian Estate!
                  </h1>
                  <p style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 13.5px; line-height: 1.6; color: #555555; max-width: 480px;">
                    ${greetingSubtitle}
                  </p>
                </td>
              </tr>

              <!-- 2x2 Photo Collage Grid (Scanned Real Website Assets) -->
              <tr>
                <td align="center" style="padding: 0 24px 24px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="8" border="0" style="margin: 0 auto;">
                    <tr>
                      <td width="50%" valign="top" style="padding: 0;">
                        <img src="https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg" alt="Luxury Living Room" width="260" style="width: 100%; height: 160px; object-fit: cover; display: block; border-radius: 12px;" />
                      </td>
                      <td width="50%" valign="top" style="padding: 0;">
                        <img src="https://www.luluaurelian.co.ke/assets/cocoa/cocoa_1.jpg" alt="Master Suite Bedroom" width="260" style="width: 100%; height: 160px; object-fit: cover; display: block; border-radius: 12px;" />
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" valign="top" style="padding: 0;">
                        <img src="https://www.luluaurelian.co.ke/assets/Neema/neema_bathroom.jpeg" alt="Designer Ensuite Bathroom" width="260" style="width: 100%; height: 160px; object-fit: cover; display: block; border-radius: 12px;" />
                      </td>
                      <td width="50%" valign="top" style="padding: 0;">
                        <img src="https://www.luluaurelian.co.ke/assets/skyview/skyview_26.jpg" alt="Panoramic Private Terrace" width="260" style="width: 100%; height: 160px; object-fit: cover; display: block; border-radius: 12px;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Centered Pill CTA Button -->
              <tr>
                <td align="center" style="padding: 0 24px 34px 24px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center">
                        <a href="${ctaUrl}" style="display: inline-block; padding: 14px 36px; background-color: #1D1912; color: #FFFFFF; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px;">
                          Take me there &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Alternating Section Header -->
              <tr>
                <td align="center" style="padding: 10px 24px 20px 24px; border-top: 1px solid #F0EDE6;">
                  <h2 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 25px; font-weight: 700; color: #1D1912; letter-spacing: -0.3px;">
                    Whether for business or leisure, enjoy!
                  </h2>
                </td>
              </tr>

              <!-- 3 Alternating Feature Rows -->
              <tr>
                <td style="padding: 0 24px 30px 24px;">
                  
                  <!-- Row 1: Left Image, Right Text -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 22px;">
                    <tr>
                      <td class="feature-col-img" width="115" valign="top" style="padding-right: 18px;">
                        <img src="https://www.luluaurelian.co.ke/assets/cocoa/cocoa_5.jpg" alt="Luxury Accommodations" width="115" height="115" style="width: 115px; height: 115px; object-fit: cover; display: block; border-radius: 14px;" />
                      </td>
                      <td valign="middle">
                        <h3 style="margin: 0 0 6px 0; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #1D1912;">
                          Luxury accommodations
                        </h3>
                        <p style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 13px; line-height: 1.55; color: #666666;">
                          Our rooms and suites offer plush bedding, modern bespoke decor, and stunning views for a sophisticated and comfortable stay.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Row 2: Left Text, Right Image -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 22px;">
                    <tr>
                      <td valign="middle" style="padding-right: 18px;">
                        <h3 style="margin: 0 0 6px 0; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #1D1912;">
                          Fine dining & modern living
                        </h3>
                        <p style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 13px; line-height: 1.55; color: #666666;">
                          Indulge in chef-ready kitchens with modern appliances, artisanal coffee bars, and serene dining spaces designed for effortless living.
                        </p>
                      </td>
                      <td class="feature-col-img" width="115" valign="top">
                        <img src="https://www.luluaurelian.co.ke/assets/Neema/neema_kitchen.jpeg" alt="Chef Ready Kitchen" width="115" height="115" style="width: 115px; height: 115px; object-fit: cover; display: block; border-radius: 14px;" />
                      </td>
                    </tr>
                  </table>

                  <!-- Row 3: Left Image, Right Text -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="feature-col-img" width="115" valign="top" style="padding-right: 18px;">
                        <img src="https://www.luluaurelian.co.ke/why.jpg" alt="Dedicated Staff & Hospitality" width="115" height="115" style="width: 115px; height: 115px; object-fit: cover; display: block; border-radius: 14px;" />
                      </td>
                      <td valign="middle">
                        <h3 style="margin: 0 0 6px 0; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #1D1912;">
                          Exceptional service
                        </h3>
                        <p style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 13px; line-height: 1.55; color: #666666;">
                          Our dedicated staff ensures your stay is comfortable and enjoyable, providing warm Kenyan hospitality for all your needs.
                        </p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Soft Mint Promotional Card Banner (Matching Image 3) -->
              <tr>
                <td style="padding: 0 24px 34px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E6EFEA; border-radius: 20px; overflow: hidden; padding: 24px;">
                    <!-- Top Promo Section -->
                    <tr>
                      <td valign="middle" style="padding-right: 16px;">
                        <h3 style="margin: 0 0 8px 0; font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 700; color: #1D1912;">
                          Book your room now!
                        </h3>
                        <p style="margin: 0 0 16px 0; font-family: 'Montserrat', sans-serif; font-size: 12.5px; line-height: 1.5; color: #4B5563;">
                          Enjoy exclusive perks, including flexible long-stay privileges when you book in advance. Simply reserve directly on our website.
                        </p>
                        <a href="${ctaUrl}" style="display: inline-block; padding: 9px 24px; background-color: transparent; color: #1D1912; border: 1.5px solid #1D1912; border-radius: 30px; font-size: 12px; font-weight: 600; text-decoration: none;">
                          Book now &rarr;
                        </a>
                      </td>
                      <td width="160" valign="middle">
                        <img src="https://www.luluaurelian.co.ke/golden_pearl.jpg" alt="Golden Pearl Terrace" width="160" style="width: 100%; max-width: 160px; height: auto; border-radius: 14px; display: block;" />
                      </td>
                    </tr>
                    <!-- 3 Feature Badges Row -->
                    <tr>
                      <td colspan="2" style="padding-top: 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid rgba(29,25,18,0.08); padding-top: 18px;">
                          <tr>
                            <td width="33.3%" align="center">
                              <span style="font-size: 20px; display: block; margin-bottom: 4px;">🎁</span>
                              <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; color: #1D1912; display: block;">Discounts & Perks</span>
                            </td>
                            <td width="33.3%" align="center">
                              <span style="font-size: 20px; display: block; margin-bottom: 4px;">📶</span>
                              <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; color: #1D1912; display: block;">High Speed Internet</span>
                            </td>
                            <td width="33.3%" align="center">
                              <span style="font-size: 20px; display: block; margin-bottom: 4px;">☕</span>
                              <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; color: #1D1912; display: block;">Free Refreshments</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Dark Footer -->
              <tr>
                <td>
                  ${this._renderBrandFooter()}
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  /**
   * Dedicated Checkout Review Survey Email Builder matching Image 1.
   * Features:
   * - "THANK YOU FOR STAYING WITH US!"
   * - 5 Emoji satisfaction buttons (😞 🙁 😐 🙂 😍)
   * - 1-10 NPS rating scale
   * - Clean "Next ->" submission CTA
   * - Brand dark footer
   */
  _renderReviewRequestEmail(booking) {
    const token = booking.secure_token || '';
    const reviewBaseUrl = `https://www.luluaurelian.co.ke/#/review?token=${token}`;

    const ratingEmojis = [
      { emoji: '😞', label: 'Very Dissatisfied', value: 1 },
      { emoji: '🙁', label: 'Dissatisfied', value: 2 },
      { emoji: '😐', label: 'Neutral', value: 3 },
      { emoji: '🙂', label: 'Satisfied', value: 4 },
      { emoji: '😍', label: 'Delighted', value: 5 }
    ];

    const emojiHtml = ratingEmojis.map(item => `
      <td align="center" style="padding: 0 8px;">
        <a href="${reviewBaseUrl}&rating=${item.value}" title="${item.label}" style="font-size: 32px; text-decoration: none; display: block; line-height: 1;">
          ${item.emoji}
        </a>
      </td>
    `).join('');

    let npsCells = '';
    for (let i = 1; i <= 10; i++) {
      npsCells += `
        <td align="center" style="padding: 2px;">
          <a href="${reviewBaseUrl}&nps=${i}" style="display: block; width: 34px; height: 34px; line-height: 34px; text-align: center; border: 1px solid #D1D5DB; background-color: #F9FAFB; color: #1D1912; text-decoration: none; border-radius: 6px; font-size: 12.5px; font-weight: 600;">
            ${i}
          </a>
        </td>
      `;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Staying With Us</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body, p, a, td, span, strong, ul, li, div { font-family: 'Montserrat', Helvetica, Arial, sans-serif !important; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Cormorant Garamond', Georgia, serif !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF9F6; padding: 30px 15px;">
        <tr>
          <td align="center">
            
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 28px; overflow: hidden; box-shadow: 0 15px 35px rgba(29,25,18,0.06); max-width: 600px; width: 100%; border: 1px solid #EFECE6;">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="padding-top: 10px;">
                  ${this._renderBrandHeader()}
                </td>
              </tr>

              <!-- Heading (Image 1) -->
              <tr>
                <td align="center" style="padding: 0 28px 24px 28px;">
                  <h1 style="margin: 0 0 14px 0; font-family: 'Montserrat', sans-serif !important; font-size: 24px; line-height: 1.25; font-weight: 800; color: #1D1912; letter-spacing: 1px; text-transform: uppercase;">
                    THANK YOU FOR STAYING WITH US!
                  </h1>
                  <p style="margin: 0; font-size: 13.5px; line-height: 1.6; color: #555555; max-width: 480px;">
                    We'd appreciate it if you could take a moment to share your thoughts to help us improve.
                  </p>
                </td>
              </tr>

              <!-- Form Body -->
              <tr>
                <td style="padding: 0 32px 30px 32px;">
                  <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 0 0 24px 0;" />

                  <h3 style="margin: 0 0 14px 0; font-family: 'Montserrat', sans-serif !important; font-size: 14.5px; font-weight: 700; color: #1D1912;">
                    Overall, how satisfied or dissatisfied are you with our company?
                  </h3>

                  <!-- Emoji Row -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                    <tr>
                      ${emojiHtml}
                    </tr>
                  </table>

                  <h3 style="margin: 0 0 14px 0; font-family: 'Montserrat', sans-serif !important; font-size: 14.5px; font-weight: 700; color: #1D1912;">
                    How likely are you to recommend Lulu Aurelian Estate?
                  </h3>

                  <!-- NPS 1-10 Row -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                    <tr>
                      ${npsCells}
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 26px;">
                    <tr>
                      <td align="left" style="font-size: 12px; color: #6B7280;">Not happy 😞</td>
                      <td align="right" style="font-size: 12px; color: #6B7280;">Very happy 😍</td>
                    </tr>
                  </table>

                  <!-- Next Button -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                    <tr>
                      <td>
                        <a href="${reviewBaseUrl}" style="display: inline-block; padding: 12px 32px; background-color: #1D1912; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">
                          Next &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                  <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 0 0 20px 0;" />

                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #666666;">
                    Thank you for choosing Lulu Aurelian Estate. We look forward to welcoming you again soon!
                  </p>
                </td>
              </tr>

              <!-- Dark Footer -->
              <tr>
                <td>
                  ${this._renderBrandFooter()}
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  /**
   * Dedicated Cancellation Email Builder matching Image 2.
   * Features:
   * - Two column header (Headline Left, Suite photo Right)
   * - Cancellation policy
   * - Concierge direct phone dial pill
   * - Dark footer
   */
  _renderCancellationEmail(booking) {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const suiteHero = unitId === 'cocoa'
      ? 'https://www.luluaurelian.co.ke/assets/cocoa/cocoa_1.jpg'
      : unitId === 'neema'
      ? 'https://www.luluaurelian.co.ke/assets/Neema/neema_1.jpeg'
      : 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg';

    const guestName = booking.guest_name || 'Guest';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Reservation has been Canceled</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body, p, a, td, span, strong, ul, li, div { font-family: 'Montserrat', Helvetica, Arial, sans-serif !important; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Cormorant Garamond', Georgia, serif !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF9F6; padding: 30px 15px;">
        <tr>
          <td align="center">
            
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 28px; overflow: hidden; box-shadow: 0 15px 35px rgba(29,25,18,0.06); max-width: 600px; width: 100%; border: 1px solid #EFECE6;">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="padding-top: 10px;">
                  ${this._renderBrandHeader()}
                </td>
              </tr>

              <!-- Two Column Header: Headline Left, Suite Image Right (Matching Image 2) -->
              <tr>
                <td style="padding: 10px 32px 24px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="middle" style="padding-right: 20px;">
                        <h1 style="margin: 0; font-family: 'Montserrat', sans-serif !important; font-size: 26px; line-height: 1.25; font-weight: 700; color: #1D1912;">
                          Your reservation<br/>has been canceled.
                        </h1>
                      </td>
                      <td width="140" valign="middle">
                        <img src="${suiteHero}" alt="Suite" width="140" style="width: 140px; height: auto; border-radius: 14px; display: block;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Greeting & Cancellation Body -->
              <tr>
                <td style="padding: 0 32px 30px 32px;">
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #1D1912; font-weight: 600;">
                    Hi ${guestName},
                  </p>
                  <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.6; color: #4B5563;">
                    We would like to inform you that your reservation at Lulu Aurelian Estate has been canceled as requested.
                  </p>
                  <p style="margin: 0 0 26px 0; font-size: 13px; line-height: 1.55; color: #6B7280;">
                    Cancellations within 24 hours of arrival will be charged for the entire stay. No-shows will be charged 100% of the booking value.
                  </p>

                  <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 0 0 28px 0;" />

                  <!-- Concierge Ready to Help Box (Matching Image 2) -->
                  <div style="text-align: center;">
                    <h2 style="margin: 0 0 8px 0; font-family: 'Montserrat', sans-serif !important; font-size: 20px; font-weight: 700; color: #1D1912;">
                      We are always ready to help!
                    </h2>
                    <p style="margin: 0 auto 20px auto; font-size: 13px; line-height: 1.55; color: #666666; max-width: 440px;">
                      If you have any questions, please don't hesitate to contact our customer support team. Reply to this email or call to connect with us.
                    </p>

                    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 24px auto;">
                      <tr>
                        <td>
                          <a href="tel:+254112299384" style="display: inline-block; padding: 12px 28px; border: 1.5px solid #D1D5DB; border-radius: 30px; text-decoration: none; color: #1D1912; font-weight: 600; font-size: 13px;">
                            <span style="color: #EF4444; margin-right: 6px;">📞</span> +254 112 299 384
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 13px; color: #666666;">
                      We hope to welcome you in the future.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Dark Footer -->
              <tr>
                <td>
                  ${this._renderBrandFooter()}
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  /**
   * Base HTML Shell Layout used to wrap all email templates with the luxury brand's layout.
   * Renders headers, footers, branding, fonts, and responsiveness.
   */
  _getHtmlTemplate(title, preheader, bodyContent, heroImage = null) {
    const defaultHero = 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg';
    const imgUrl = heroImage || defaultHero;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body, p, a, td, span, strong, ul, li, div { font-family: 'Montserrat', Helvetica, Arial, sans-serif !important; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Cormorant Garamond', Georgia, serif !important; font-weight: 600 !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-font-smoothing: antialiased;">
      <!-- Preheader (Hidden inbox preview) -->
      <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
        ${preheader}
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF9F6; padding: 30px 15px;">
        <tr>
          <td align="center">
            
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 28px; overflow: hidden; box-shadow: 0 15px 35px rgba(29,25,18,0.06); max-width: 600px; width: 100%; border: 1px solid #EFECE6;">
              
              <!-- Brand Header with Centered Crest -->
              <tr>
                <td align="center" style="padding-top: 10px;">
                  ${this._renderBrandHeader()}
                </td>
              </tr>

              <!-- Hero Image with Rounded Corners -->
              <tr>
                <td align="center" style="background-color: #FFFFFF; padding: 0 24px;">
                  <img src="${imgUrl}" alt="Lulu Aurelian Suite" style="width: 100%; max-width: 552px; height: auto; display: block; border-radius: 16px;" />
                </td>
              </tr>

              <!-- Dynamic Content Area -->
              <tr>
                <td style="padding: 34px 28px; background-color: #FFFFFF;">
                  ${bodyContent}
                </td>
              </tr>

              <!-- Dark Footer Block -->
              <tr>
                <td>
                  ${this._renderBrandFooter()}
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  _renderBadge(text) {
    if (!text) return '';
    return `<p style="margin: 0 0 15px 0; font-size: 13px; color: #cfa873; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">${text}</p>`;
  }

  _renderHeading(line1, line2) {
    if (!line1 && !line2) return '';
    return `<h2 style="margin: 0 0 25px 0; font-size: 32px; font-weight: 300; color: #1a1a1a; letter-spacing: -1px; line-height: 1.1;">${line1 || ''}<br/><span style="color: #cfa873;">${line2 || ''}</span></h2>`;
  }

  _renderParagraphs(paragraphs) {
    if (!paragraphs || !paragraphs.length) return '';
    return paragraphs.map(p => `<p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">${p}</p>`).join('');
  }

  _renderAlertBox(text) {
    if (!text) return '';
    return `
      <div style="background-color: #FAF9F6; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #cfa873;">
        <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #1a1a1a;">${text}</p>
      </div>
    `;
  }

  _renderBookingRef(ref) {
    if (!ref) return '';
    return `<p style="margin: 0 0 30px 0; font-size: 14px; color: #888;">Booking Reference: <strong>#${ref}</strong></p>`;
  }

  _renderButton(btn) {
    if (!btn || !btn.label || !btn.url) return '';
    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left">
            <a href="${btn.url}" style="display: inline-block; padding: 16px 36px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 1px;">${btn.label} &rarr;</a>
          </td>
        </tr>
      </table>
    `;
  }

  _renderCenterButton(btn) {
    if (!btn || !btn.label || !btn.url) return '';
    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <a href="${btn.url}" style="display: inline-block; padding: 16px 36px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 1px;">${btn.label} &rarr;</a>
          </td>
        </tr>
      </table>
    `;
  }

  _renderCredentialsBox(credentials) {
    if (!credentials) return '';
    const titleHtml = credentials.title ? `<h4 style="margin: 0 0 15px 0; font-size: 13px; color: #cfa873; text-transform: uppercase; letter-spacing: 1px;">${credentials.title}</h4>` : '';
    const itemsHtml = credentials.items.map(item => {
      const extraHtml = item.extra ? ` <i style="color: #888;">${item.extra}</i>` : '';
      return `<p style="margin: 0 0 10px 0; font-size: 14px; color: #cccccc;"><strong>${item.label}:</strong> <span style="color: #ffffff; font-weight: bold; font-size: 16px;">${item.value}</span>${extraHtml}</p>`;
    }).join('');
    return `
      <div style="background-color: #1a1a1a; color: #ffffff; padding: 25px; border-radius: 16px; margin-bottom: 25px;">
        ${titleHtml}
        ${itemsHtml}
      </div>
    `;
  }

  _renderRulesList(rules) {
    if (!rules || !rules.items || !rules.items.length) return '';
    const title = rules.title || '🏡 House Rules & Stay Guidelines';
    const itemsHtml = rules.items.map(item => `
      <tr style="border-bottom: 1px solid #f0ece3;">
        <td style="padding: 10px 0; font-size: 13px; color: #4a4a4a; line-height: 1.6; font-family: 'Montserrat', Helvetica, Arial, sans-serif;">
          ${item}
        </td>
      </tr>
    `).join('');

    return `
      <div style="background-color: #FAF9F6; border: 1px solid #e5dfd3; border-radius: 16px; padding: 22px; margin-bottom: 25px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 12px; border-bottom: 2px solid #cfa873;">
              <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #1a1a1a; letter-spacing: 0.5px;">${title}</h4>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #777777;">To ensure a comfortable, safe, and enjoyable stay, please observe these guidelines during your time with us:</p>
            </td>
          </tr>
          ${itemsHtml}
          <tr>
            <td style="padding-top: 14px; text-align: center;">
              <a href="https://www.luluaurelian.co.ke/#/portal" target="_blank" style="color: #cfa873; font-weight: 600; font-size: 12px; text-decoration: underline;">
                📖 View Complete Digital House Rules in Guest Portal &rarr;
              </a>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  _renderPromoBox(promo) {
    if (!promo) return '';
    return `
      <div style="background-color: #FAF9F6; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center; border: 1px dashed #cfa873;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #4a4a4a; text-transform: uppercase; letter-spacing: 1px;">${promo.label}</p>
        <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1a1a1a;">${promo.code}</p>
      </div>
    `;
  }

  _renderLocationBlock(unitId) {
    const details = UNIT_WELCOME_DETAILS[(unitId || 'skyview').toLowerCase()] || UNIT_WELCOME_DETAILS.skyview;
    return `
      <div style="background-color: #FAF9F6; border: 1px solid #e5dfd3; padding: 22px; border-radius: 16px; margin-bottom: 25px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="36" valign="top" style="padding-top: 2px;">
              <img src="https://img.icons8.com/ios-filled/50/cfa873/marker.png" alt="Map Pin" width="24" height="24" style="display: block;" />
            </td>
            <td>
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; letter-spacing: 0.5px;">Location & Coordinates</h4>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666666; line-height: 1.5; font-family: 'Montserrat', Helvetica, Arial, sans-serif;">
                <strong>${details.name}</strong><br/>
                ${details.location}
              </p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="${details.mapUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #cfa873; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 12px; letter-spacing: 0.5px;">
                      📍 Open Location Pin on Google Maps &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  _renderContactCards() {
    return `
      <div style="background-color: #FAF9F6; border: 1px solid #e5dfd3; padding: 20px; border-radius: 14px; margin-bottom: 25px;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">📞 Guest Support & Host Assistance</h4>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #555555; line-height: 1.5;">
          Should you need any assistance during your stay, feel free to reach out to our team:
        </p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding: 6px 0;">
              <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">Safaricom:</span>
              <a href="tel:0112299384" style="margin-left: 8px; color: #cfa873; text-decoration: underline; font-weight: 700; font-size: 15px;">0112299384</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">
              <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">Airtel:</span>
              <a href="tel:0756958531" style="margin-left: 8px; color: #cfa873; text-decoration: underline; font-weight: 700; font-size: 15px;">0756958531</a>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  _renderChecklist(checklist) {
    if (!checklist || !checklist.length) return '';
    const itemsHtml = checklist.map(item => `
      <div style="background-color: #FAF9F6; border-left: 3px solid #cfa873; padding: 14px 18px; margin-bottom: 12px; border-radius: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #1a1a1a; font-weight: 600;">${item.title}</h4>
        <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.5;">${item.desc}</p>
      </div>
    `).join('');
    return `<div style="margin-bottom: 25px;">${itemsHtml}</div>`;
  }

  // ==========================================
  // SERVICE METHODS
  // ==========================================

  async sendEmail({ to, subject, html, text }) {
    // 1. Try Resend API first (HTTP Port 443)
    if (env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM,
            to: typeof to === 'string' ? to.split(',').map(e => e.trim()) : to,
            subject: subject,
            html: html || text
          })
        });

        const data = await response.json();

        if (response.ok && data.id) {
          console.log(`[EMAIL DISPATCHER] Successfully sent via Resend to ${to}. Resend ID: ${data.id}`);
          return { success: true, messageId: data.id };
        } else {
          console.error(`[EMAIL DISPATCHER] Resend API Error:`, data);
        }
      } catch (error) {
        console.error(`[EMAIL DISPATCHER] Resend fetch failed:`, error);
      }
    }

    // 2. Nodemailer / SMTP Fallback
    if (env.SMTP_USER && env.SMTP_PASS) {
      try {
        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        });

        const info = await transporter.sendMail({
          from: env.EMAIL_FROM,
          to: to,
          subject: subject,
          text: text,
          html: html
        });

        console.log(`[EMAIL DISPATCHER - SMTP] Successfully sent to ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (smtpErr) {
        console.error(`[EMAIL DISPATCHER - SMTP ERROR]:`, smtpErr);
      }
    }

    console.warn(`[EMAIL DISPATCHER] No email transport succeeded for ${to}.`);
    return { success: false, error: 'No working email configuration' };
  }

  async sendBookingConfirmation(booking) {
    const data = EMAIL_TEMPLATES.BOOKING_CONFIRMATION(booking);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderAlertBox(data.alertText) +
      this._renderLocationBlock(booking.unit_id) +
      this._renderContactCards() +
      this._renderBookingRef(data.bookingRef) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    const unitDetails = UNIT_WELCOME_DETAILS[(booking.unit_id || 'skyview').toLowerCase()] || UNIT_WELCOME_DETAILS.skyview;
    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: `${data.text}\nLocation: ${unitDetails.location}\nGoogle Maps: ${unitDetails.mapUrl}`,
      html
    });
  }

  async sendPaymentSuccess(booking) {
    const data = EMAIL_TEMPLATES.PAYMENT_SUCCESS_CONFIRMATION(booking);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderAlertBox(data.alertText) +
      this._renderLocationBlock(booking.unit_id) +
      this._renderContactCards() +
      this._renderBookingRef(data.bookingRef) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendCheckInCredentials(booking) {
    return this.sendFulfillmentCredentials(booking);
  }

  async sendFulfillmentCredentials(booking) {
    const settings = await db.unit_settings.getSettings(booking.unit_id);
    const bookingWithSettings = {
      ...booking,
      passcode: settings.passcode,
      house_number: settings.house_number,
      wifi_ssid: settings.wifi_ssid,
      wifi_password: settings.wifi_password
    };
    const data = EMAIL_TEMPLATES.FULFILLMENT_CREDENTIALS(bookingWithSettings);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderCredentialsBox(data.credentials) +
      this._renderLocationBlock(booking.unit_id) +
      this._renderContactCards() +
      this._renderRulesList(data.rules) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendCheckoutMorningReminder(booking) {
    const data = EMAIL_TEMPLATES.CHECKOUT_MORNING_REMINDER(booking);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderChecklist(data.checklist) +
      `<p style="margin: 20px 0; font-size: 15px; color: #4a4a4a; line-height: 1.6;">${data.closing}</p>` +
      this._renderContactCards() +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendNewsletterWelcome(email) {
    const data = EMAIL_TEMPLATES.NEWSLETTER_WELCOME(email);
    // Uses the dedicated Image 3 Welcome layout with 2x2 collage, alternating feature cards, and perks banner
    const html = this._renderWelcomeExperienceEmail({
      title: data.title,
      preheader: data.preheader,
      guestName: null,
      ctaUrl: data.button?.url || 'https://www.luluaurelian.co.ke/#/units'
    });

    return this.sendEmail({
      to: email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendAccountCreationWelcome(email, name) {
    const data = EMAIL_TEMPLATES.ACCOUNT_CREATION_WELCOME(email, name);
    // Uses the dedicated Image 3 Welcome layout personalized for new guest registration
    const html = this._renderWelcomeExperienceEmail({
      title: data.title,
      preheader: data.preheader,
      guestName: name,
      ctaUrl: data.button?.url || 'https://www.luluaurelian.co.ke/#/portal'
    });

    return this.sendEmail({
      to: email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendCheckInDayReminder(booking) {
    const settings = await db.unit_settings.getSettings(booking.unit_id);
    const bookingWithSettings = {
      ...booking,
      passcode: settings.passcode,
      house_number: settings.house_number,
      wifi_ssid: settings.wifi_ssid,
      wifi_password: settings.wifi_password
    };
    const data = EMAIL_TEMPLATES.CHECK_IN_DAY_REMINDER(bookingWithSettings);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderLocationBlock(booking.unit_id) +
      (bookingWithSettings.passcode ? this._renderCredentialsBox({
        title: 'Check-In Access Credentials',
        items: [
          { label: 'Check-In Time', value: 'From 14:00 PM (2:00 PM)' },
          { label: 'Key Box PIN', value: bookingWithSettings.passcode },
          { label: 'Wi-Fi SSID', value: bookingWithSettings.wifi_ssid || 'LuluAurelian_5G' },
          { label: 'Wi-Fi Password', value: bookingWithSettings.wifi_password || 'Luxury2026!' }
        ]
      }) : '') +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    const unitDetails = UNIT_WELCOME_DETAILS[(booking.unit_id || 'skyview').toLowerCase()] || UNIT_WELCOME_DETAILS.skyview;
    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: `${data.text}\nLocation: ${unitDetails.location}\nGoogle Maps Pin: ${unitDetails.mapUrl}`,
      html
    });
  }

  async sendCheckInFollowUp(booking) {
    const data = EMAIL_TEMPLATES.CHECK_IN_FOLLOW_UP(booking);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderLocationBlock(booking.unit_id) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    const unitDetails = UNIT_WELCOME_DETAILS[(booking.unit_id || 'skyview').toLowerCase()] || UNIT_WELCOME_DETAILS.skyview;
    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: `${data.text}\nLocation: ${unitDetails.location}\nGoogle Maps: ${unitDetails.mapUrl}`,
      html
    });
  }

  async sendCheckoutReviewRequest(booking) {
    const data = EMAIL_TEMPLATES.CHECKOUT_REVIEW_REQUEST(booking);
    // Uses dedicated survey layout matching Image 1 with satisfaction emojis & 1-10 NPS scale
    const html = this._renderReviewRequestEmail(booking);

    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendHolidayMarketing(email, holidayName) {
    const data = EMAIL_TEMPLATES.HOLIDAY_MARKETING(email, holidayName);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderPromoBox(data.promo) +
      this._renderCenterButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendNewsletterBlog(email, blogData) {
    const data = EMAIL_TEMPLATES.NEWSLETTER_BLOG(blogData);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendNewsletterCampaign(email, subject, bodyHtml) {
    const data = EMAIL_TEMPLATES.NEWSLETTER_CAMPAIGN(subject, bodyHtml);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      `<div style="margin-bottom: 25px; line-height: 1.6; color: #4a4a4a; font-size: 16px;">${data.htmlOverride}</div>` +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendGuestCancellation(booking) {
    const data = EMAIL_TEMPLATES.GUEST_CANCELLATION(booking);
    // Uses dedicated cancellation layout matching Image 2 with two-column hero and direct concierge dial
    const html = this._renderCancellationEmail(booking);

    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendAgentInvitation(email, name, role, inviteToken) {
    const data = EMAIL_TEMPLATES.AGENT_INVITATION(name, role, inviteToken);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendAgentBookingAlert(emails, booking) {
    const title = 'New Booking Alert';
    const unitName = booking.unit_id === 'skyview' ? 'Skyview Hideaway' : booking.unit_id === 'cocoa' ? 'Cocoa Retreat' : 'Neema Haven';
    const inDateReadable = formatDateEAT(booking.check_in);
    const outDateReadable = formatDateEAT(booking.check_out);
    const preheader = `New booking request from ${booking.guest_name} for ${unitName}.`;

    let cleaningText = '';
    let cleaningDates = [];
    if (booking.cleaning_dates) {
      cleaningDates = typeof booking.cleaning_dates === 'string' ? JSON.parse(booking.cleaning_dates) : booking.cleaning_dates;
      if (cleaningDates && cleaningDates.length > 0) {
        cleaningText = `<br/><br/><strong>Cleaning Service Requested:</strong><br/>` + cleaningDates.map(d => `- ${d}`).join('<br/>');
      }
    }

    const bodyContent =
      this._renderBadge('INTERNAL ALERT · NEW RESERVATION') +
      this._renderHeading('New Booking', 'Received') +
      this._renderParagraphs([
        `A new booking has been created on the system and is awaiting payment hold completion.`,
        `<strong>Guest:</strong> ${booking.guest_name} (${booking.guest_email})<br/>
         <strong>Phone:</strong> ${booking.guest_phone}<br/>
         <strong>Unit:</strong> ${unitName}<br/>
         <strong>Check-in:</strong> ${inDateReadable} (from 2:00 PM EAT)<br/>
         <strong>Check-out:</strong> ${outDateReadable} (by 10:00 AM EAT)${cleaningText}`
      ]) +
      this._renderButton({ label: 'View in Staff Portal', url: 'https://www.luluaurelian.co.ke/#/portal' });

    const html = this._getHtmlTemplate(title, preheader, bodyContent);

    return this.sendEmail({
      to: Array.isArray(emails) ? emails.join(',') : emails,
      subject: `[ALERT] New Booking - ${unitName} (${inDateReadable})`,
      text: `New booking from ${booking.guest_name} for ${unitName}. Check-in: ${inDateReadable}, Check-out: ${outDateReadable}. Check portal for details.`,
      html
    });
  }

  async sendStaffPaymentAlert(emails, booking, paymentInfo = {}) {
    if (!emails || (Array.isArray(emails) && emails.length === 0)) return;

    const recipientList = Array.isArray(emails) ? emails : [emails];
    const cleanRecipients = recipientList.map(e => String(e).trim()).filter(Boolean);
    if (!cleanRecipients.length) return;

    const data = EMAIL_TEMPLATES.STAFF_PAYMENT_ALERT(booking, paymentInfo);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderAlertBox(data.alertText) +
      this._renderLocationBlock(booking.unit_id) +
      this._renderBookingRef(data.bookingRef) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: cleanRecipients.join(','),
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendPasswordReset(email, resetLink) {
    const title = 'Reset Your Password';
    const preheader = 'Securely reset your Lulu Aurelian Estate account password.';
    const heroImage = 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg';

    const bodyContent =
      this._renderBadge('SECURITY') +
      this._renderHeading('Password Reset', 'Request') +
      this._renderParagraphs([
        `Hello,`,
        `We received a request to reset the password associated with your account.`,
        `If you made this request, please click the secure link below to choose a new password. This link will expire in 1 hour.`,
        `If you did not request a password reset, you can safely ignore this email.`
      ]) +
      this._renderButton({ label: 'Reset Password', url: resetLink });

    const html = this._getHtmlTemplate(title, preheader, bodyContent, heroImage);

    return this.sendEmail({
      to: email,
      subject: 'Lulu Aurelian - Password Reset Request',
      text: `Reset your password by visiting this link: ${resetLink}`,
      html
    });
  }
}

export const emailService = new EmailService();
