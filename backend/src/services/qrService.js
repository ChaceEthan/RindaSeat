// @ts-nocheck
const QRCode = require('qrcode');

const buildBookingQrPayload = (booking) => {
  const expirationMinutes = Number(process.env.QR_CODE_EXPIRATION_MINUTES) || 30;
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + expirationMinutes * 60 * 1000);

  return {
    bookingId: booking.id,
    tripId: booking.trip_id,
    seatNumber: booking.seat_number,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
};

const dataUrlToBuffer = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return null;
  }

  const base64 = dataUrl.includes(',') ? dataUrl.split(',').pop() : dataUrl;
  return Buffer.from(base64, 'base64');
};

const generateBookingQrCode = async (booking) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(buildBookingQrPayload(booking)));
  } catch (error) {
    console.warn(`[QR WARNING] QR generation failed: ${error.message}`);
    return null;
  }
};

const generateBookingQrCodeBuffer = async (booking) => {
  try {
    return await QRCode.toBuffer(JSON.stringify(buildBookingQrPayload(booking)), {
      type: 'png'
    });
  } catch (error) {
    console.warn(`[QR WARNING] QR buffer generation failed: ${error.message}`);
    return null;
  }
};

module.exports = {
  dataUrlToBuffer,
  generateBookingQrCode,
  generateBookingQrCodeBuffer
};
