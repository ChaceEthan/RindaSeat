// @ts-nocheck
const { dataUrlToBuffer } = require('./qrService');

const isConfigured = () => (
  Boolean(process.env.SMTP_HOST)
  && Boolean(process.env.SMTP_USER)
  && Boolean(process.env.SMTP_PASS)
  && Boolean(process.env.EMAIL_FROM)
);

const getNodemailer = () => {
  try {
    return require('nodemailer');
  } catch (error) {
    console.warn('[EMAIL] Nodemailer not installed');
    return null;
  }
};

const createTransport = () => {
  const nodemailer = getNodemailer();

  if (!nodemailer) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
  });
};

const getTripLabel = (booking) => {
  const origin = booking.origin || 'Origin';
  const destination = booking.destination || 'Destination';
  return `${origin} -> ${destination}`;
};

const getQrAttachment = (qrImage) => {
  const content = Buffer.isBuffer(qrImage) ? qrImage : dataUrlToBuffer(qrImage);

  if (!content) {
    return [];
  }

  return [{
    filename: 'rindaseat-ticket-qr.png',
    content,
    contentType: 'image/png',
    cid: 'rindaseat-ticket-qr'
  }];
};

const buildEmailHtml = (user, booking) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
      .content { background: #f9fafb; padding: 20px; }
      .section { margin: 15px 0; }
      .label { font-weight: bold; color: #374151; }
      .value { color: #6b7280; margin-top: 3px; }
      .qr-section { text-align: center; margin: 20px 0; }
      .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin: 0;">RindaSeat</h2>
        <p style="margin: 5px 0 0 0;">Smart Transport Reservation System</p>
      </div>
      <div class="content">
        <p>Hello <strong>${user.full_name || user.fullName || user.name || 'Passenger'}</strong>,</p>
        <p>Your ticket has been confirmed. Here are your booking details:</p>
        <div class="section"><div class="label">Trip</div><div class="value">${getTripLabel(booking)}</div></div>
        <div class="section"><div class="label">Seat</div><div class="value">${booking.seat_number || booking.seatNumber}</div></div>
        <div class="section"><div class="label">Booking ID</div><div class="value">${booking.id}</div></div>
        <div class="section"><div class="label">Payment Status</div><div class="value">${(booking.payment_status || booking.paymentStatus || 'pending').toUpperCase()}</div></div>
        <div class="section"><div class="label">Company</div><div class="value">${booking.company_name || 'N/A'}</div></div>
        <div class="qr-section">
          <p style="color: #6b7280; font-size: 14px;">Please present this QR code before boarding:</p>
          <img src="cid:rindaseat-ticket-qr" alt="RindaSeat ticket QR code" style="width: 180px; height: 180px; border: 1px solid #d1d5db; border-radius: 5px;" />
        </div>
      </div>
      <div class="footer">
        <p>Copyright ${new Date().getFullYear()} RindaSeat. All rights reserved.</p>
        <p>This is an automated email. Please do not reply directly.</p>
      </div>
    </div>
  </body>
  </html>
`;

const buildEmailText = (user, booking) => (
  `RindaSeat - Smart Transport Reservation System\n\n`
  + `Hello ${user.full_name || user.fullName || user.name || 'Passenger'},\n\n`
  + `Your ticket has been confirmed.\n\n`
  + `Trip: ${getTripLabel(booking)}\n`
  + `Seat: ${booking.seat_number || booking.seatNumber}\n`
  + `Booking ID: ${booking.id}\n`
  + `Payment Status: ${(booking.payment_status || booking.paymentStatus || 'pending').toUpperCase()}\n`
  + `Company: ${booking.company_name || 'N/A'}\n\n`
  + `Please present the attached QR code before boarding.\n\n`
  + `Thank you for choosing RindaSeat.\n`
);

const sendBookingConfirmationEmail = async (user, booking, qrImage) => {
  if (!isConfigured()) {
    console.warn('[EMAIL] SMTP not configured - skipping email notification');
    return {
      success: false,
      message: 'SMTP not configured',
      skipped: true
    };
  }

  if (!user.email) {
    console.warn('[EMAIL] User email missing - cannot send confirmation');
    return {
      success: false,
      message: 'User email missing',
      skipped: true
    };
  }

  const transport = createTransport();

  if (!transport) {
    console.warn('[EMAIL] Email transport not available - skipping email notification');
    return {
      success: false,
      message: 'Email transport not available',
      skipped: true
    };
  }

  try {
    const result = await transport.sendMail({
      from: `"RindaSeat" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'RindaSeat - Booking Confirmation',
      text: buildEmailText(user, booking),
      html: buildEmailHtml(user, booking),
      attachments: getQrAttachment(qrImage),
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM
    });

    console.log(`[EMAIL] Booking confirmation sent to ${user.email}`);

    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error(`[EMAIL] Booking confirmation failed: ${error.message}`);

    return {
      success: false,
      message: 'Email could not be sent',
      error: error.code
    };
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  isConfigured
};
