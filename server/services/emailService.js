import { env } from '../config/env.js';
import { EMAIL_TEMPLATES } from '../config/constants.js';
import { db } from '../config/db.js';

class EmailService {
  constructor() {
    // Using Resend API (HTTP Port 443), bypassing Railway SMTP blocks.
  }

  // ==========================================
  // HTML STYLING COMPONENT BUILDERS
  // ==========================================

  /**
   * Base HTML Shell Layout used to wrap all email templates with the luxury brand's layout.
   * Renders headers, footers, branding, fonts, and responsiveness.
   */
  _getHtmlTemplate(title, preheader, bodyContent, heroImage = null) {
    const defaultHero = 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920301.jpg?k=a54142f102014f7ca339af537b0a4c026ed95739c5a2550dfc39f8129ef294ff&o=';
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
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
      <style>
        body, p, a, td, span, strong, ul, li, div, h1, h2, h3, h4, h5, h6 { font-family: 'Montserrat', Helvetica, Arial, sans-serif !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-font-smoothing: antialiased;">
      <!-- Preheader (Hidden but visible in inbox preview) -->
      <div style="display: none; max-height: 0px; overflow: hidden;">
        ${preheader}
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF9F6; padding: 40px 20px;">
        <tr>
          <td align="center">
            
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); max-width: 600px; width: 100%;">
              
              <!-- Header Brand -->
              <tr>
                <td align="center" style="padding: 30px 20px; background-color: #FFFFFF;">
                  <h1 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 3px; color: #1a1a1a; text-transform: uppercase;">
                    <span style="color: #cfa873;">Lulu</span> Aurelian
                  </h1>
                </td>
              </tr>

              <!-- Hero Image with Organic Rounded Bottom -->
              <tr>
                <td align="center" style="background-color: #FAF9F6; padding: 0 20px;">
                  <img src="${imgUrl}" alt="Lulu Aurelian Suite" style="width: 100%; max-width: 560px; height: auto; display: block; border-radius: 20px;" />
                </td>
              </tr>

              <!-- Dynamic Content Area -->
              <tr>
                <td style="padding: 40px 30px; background-color: #FFFFFF;">
                  ${bodyContent}
                </td>
              </tr>

              <!-- Footer block -->
              <tr>
                <td align="center" style="padding: 40px 30px; background-color: #1a1a1a; color: #ffffff;">
                  <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 400; letter-spacing: 1px;">Lulu Aurelian Estate</h3>
                  <p style="margin: 0 0 20px 0; font-size: 13px; color: #999999; line-height: 1.5;">Skyline Apartments, Nyeri, Kenya</p>
                  
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding: 0 15px;"><a href="https://www.luluaurelian.co.ke" style="color: #cfa873; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Website</a></td>
                      <td style="padding: 0 15px;"><a href="https://www.luluaurelian.co.ke/#/portal" style="color: #cfa873; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Guest Portal</a></td>
                    </tr>
                  </table>
                  
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tr>
                      <td style="padding: 0 10px;"><a href="https://instagram.com" style="color: #cfa873; text-decoration: none; font-size: 11px; text-transform: uppercase; font-weight: 600;">Instagram</a></td>
                      <td style="padding: 0 10px;"><a href="https://tiktok.com" style="color: #cfa873; text-decoration: none; font-size: 11px; text-transform: uppercase; font-weight: 600;">TikTok</a></td>
                      <td style="padding: 0 10px;"><a href="https://facebook.com" style="color: #cfa873; text-decoration: none; font-size: 11px; text-transform: uppercase; font-weight: 600;">Facebook</a></td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0 0; font-size: 11px; color: #555555; text-transform: uppercase; letter-spacing: 1px;">© 2026 Lulu Aurelian Estate.</p>
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
    if (!rules) return '';
    const titleHtml = rules.title ? `<h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1a1a1a;">${rules.title}</h4>` : '';
    const itemsHtml = rules.items.map(item => `<li>${item}</li>`).join('');
    return `
      ${titleHtml}
      <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
        ${itemsHtml}
      </ul>
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

  // ==========================================
  // SERVICE METHODS
  // ==========================================

  async sendEmail({ to, subject, html, text }) {
    if (!env.RESEND_API_KEY) {
      console.warn(`[EMAIL DISPATCHER] Cannot send email. RESEND_API_KEY is not configured in environment.`);
      return { success: false, error: 'RESEND_API_KEY missing' };
    }

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
        console.log(`[EMAIL DISPATCHER] Successfully sent to ${to}. Resend ID: ${data.id}`);
        return { success: true, messageId: data.id };
      } else {
        console.error(`[EMAIL DISPATCHER] Resend API Error:`, data);
        return { success: false, error: data.message || 'Resend API Error' };
      }
    } catch (error) {
      console.error(`[EMAIL DISPATCHER] Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendBookingConfirmation(booking) {
    const data = EMAIL_TEMPLATES.BOOKING_CONFIRMATION(booking);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderAlertBox(data.alertText) +
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

  async sendFulfillmentCredentials(booking) {
    const passcode = await db.unit_settings.getPasscode(booking.unit_id);
    const bookingWithPasscode = { ...booking, passcode };
    const data = EMAIL_TEMPLATES.FULFILLMENT_CREDENTIALS(bookingWithPasscode);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderCredentialsBox(data.credentials) +
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

  async sendNewsletterWelcome(email) {
    const data = EMAIL_TEMPLATES.NEWSLETTER_WELCOME(email);
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

  async sendAccountCreationWelcome(email, name) {
    const data = EMAIL_TEMPLATES.ACCOUNT_CREATION_WELCOME(email, name);
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

  async sendCheckInFollowUp(booking) {
    const data = EMAIL_TEMPLATES.CHECK_IN_FOLLOW_UP(booking);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendCheckoutReviewRequest(booking) {
    const data = EMAIL_TEMPLATES.CHECKOUT_REVIEW_REQUEST(booking);
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

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
    const bodyContent =
      this._renderBadge(data.badge) +
      this._renderHeading(data.headingLine1, data.headingLine2) +
      this._renderParagraphs(data.paragraphs) +
      this._renderButton(data.button);

    const html = this._getHtmlTemplate(data.title, data.preheader, bodyContent, data.heroImage);

    return this.sendEmail({
      to: booking.guest_email,
      subject: data.subject,
      text: data.text,
      html
    });
  }

  async sendAgentBookingAlert(emails, booking) {
    const title = 'New Booking Alert';
    const preheader = `New booking request from ${booking.guest_name} for ${booking.unit_id}.`;

    let cleaningText = '';
    let cleaningDates = [];
    if (booking.cleaning_dates) {
      cleaningDates = typeof booking.cleaning_dates === 'string' ? JSON.parse(booking.cleaning_dates) : booking.cleaning_dates;
      if (cleaningDates && cleaningDates.length > 0) {
        cleaningText = `<br/><br/><strong>Cleaning Service Requested:</strong><br/>` + cleaningDates.map(d => `- ${d}`).join('<br/>');
      }
    }

    const bodyContent =
      this._renderBadge('INTERNAL ALERT') +
      this._renderHeading('New Booking', 'Received') +
      this._renderParagraphs([
        `A new booking has been created on the system.`,
        `<strong>Guest:</strong> ${booking.guest_name} (${booking.guest_email})<br/>
         <strong>Phone:</strong> ${booking.guest_phone}<br/>
         <strong>Unit:</strong> ${booking.unit_id === 'skyview' ? 'Skyview Hideaway' : 'Cocoa Retreat'}<br/>
         <strong>Check-in:</strong> ${booking.check_in}<br/>
         <strong>Check-out:</strong> ${booking.check_out}${cleaningText}`
      ]) +
      this._renderButton({ label: 'View in Portal', url: 'https://luluaurelian.co.ke/portal' });

    const html = this._getHtmlTemplate(title, preheader, bodyContent);

    return this.sendEmail({
      to: emails.join(','),
      subject: `[ALERT] New Booking - ${booking.unit_id.toUpperCase()}`,
      text: `New booking from ${booking.guest_name} for ${booking.unit_id}. Check portal for details.`,
      html
    });
  }

  async sendPasswordReset(email, resetLink) {
    const title = 'Reset Your Password';
    const preheader = 'Securely reset your Lulu Aurelian Estate account password.';
    const heroImage = 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920301.jpg?k=a54142f102014f7ca339af537b0a4c026ed95739c5a2550dfc39f8129ef294ff&o=';

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
