// @ts-nocheck
const isConfigured = () => (
  Boolean(process.env.SMS_API_KEY)
  && Boolean(process.env.SMS_SENDER_ID)
  && Boolean(process.env.SMS_API_URL)
);

const validatePhoneNumber = (phone) => {
  if (!phone) {
    return false;
  }

  const cleaned = String(phone).replace(/\D/g, '');
  return cleaned.length >= 10;
};

const sendBookingSMS = async (phone, message) => {
  if (!isConfigured()) {
    console.warn('[SMS] Service not configured - skipping SMS notification');
    return {
      success: false,
      message: 'SMS service not configured',
      skipped: true
    };
  }

  if (!phone || !validatePhoneNumber(phone)) {
    console.warn('[SMS] Invalid phone number - cannot send SMS');
    return {
      success: false,
      message: 'Invalid phone number',
      skipped: true
    };
  }

  if (!message) {
    return {
      success: false,
      message: 'Message content missing',
      skipped: true
    };
  }

  try {
    const response = await fetch(process.env.SMS_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SMS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: process.env.SMS_SENDER_ID,
        to: phone,
        message
      }),
      timeout: 10000
    });

    if (!response.ok) {
      console.error(`[SMS] Provider returned ${response.status}`);
      return {
        success: false,
        message: `SMS provider error: ${response.status}`
      };
    }

    console.log(`[SMS] SMS sent to ${phone}`);

    return {
      success: true
    };
  } catch (error) {
    console.error(`[SMS] Send failed: ${error.message}`);
    return {
      success: false,
      message: 'SMS could not be sent'
    };
  }
};

const sendPaymentReminderSMS = async (phone, bookingId) => {
  const message = `RindaSeat: Don't forget to complete your payment for booking ${bookingId}. Visit our app to pay now.`;
  return sendBookingSMS(phone, message);
};

const sendTripReminderSMS = async (phone, tripInfo) => {
  const message = `RindaSeat: Your trip ${tripInfo.origin} -> ${tripInfo.destination} departs in 2 hours from ${tripInfo.station}. Be there 15 minutes early.`;
  return sendBookingSMS(phone, message);
};

module.exports = {
  sendBookingSMS,
  sendPaymentReminderSMS,
  sendTripReminderSMS,
  isConfigured,
  validatePhoneNumber
};
