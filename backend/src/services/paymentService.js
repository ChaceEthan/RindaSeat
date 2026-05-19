// @ts-nocheck
const { v4: uuidv4 } = require('uuid');

const PLACEHOLDER_PATTERN = /^(YOUR_|REPLACE|CHANGE_ME|TODO)|_HERE$/i;

const hasValue = (value) => {
  const normalizedValue = String(value || '').trim();
  return Boolean(normalizedValue) && !PLACEHOLDER_PATTERN.test(normalizedValue);
};

const paymentProviderNotConfigured = () => ({
  success: false,
  message: 'Payment provider not configured'
});

const isStripeConfigured = () => hasValue(process.env.STRIPE_SECRET_KEY);

const isMomoConfigured = () => (
  hasValue(process.env.MTN_MOMO_API_KEY)
  && hasValue(process.env.MTN_MOMO_SUBSCRIPTION_KEY)
);

const isPaymentProviderConfigured = (method) => {
  if (method === 'card') {
    return isStripeConfigured();
  }

  if (method === 'mobile_money') {
    return isMomoConfigured();
  }

  return true;
};

const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const initializePayment = async ({ bookingId, amount, method }) => {
  if (!isPaymentProviderConfigured(method)) {
    return paymentProviderNotConfigured();
  }

  if (!validateUUID(bookingId)) {
    return {
      success: false,
      message: 'Invalid booking ID format'
    };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      message: 'Invalid payment amount'
    };
  }

  return {
    success: true,
    bookingId,
    amount,
    method,
    transactionId: uuidv4(),
    status: 'pending'
  };
};

const createMomoRequestToPay = async ({ amount, phone, bookingId }) => {
  if (!isMomoConfigured()) {
    return {
      success: false,
      message: 'MTN MoMo not configured'
    };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      message: 'Invalid amount'
    };
  }

  if (!phone) {
    return {
      success: false,
      message: 'Phone number required'
    };
  }

  const transactionId = uuidv4();

  try {
    const endpoint = `${process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com'}/v1/requesttopay`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Reference-Id': transactionId,
        'X-Target-Environment': process.env.MTN_MOMO_TARGET_ENV || 'sandbox',
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: process.env.DEFAULT_CURRENCY || 'RWF',
        externalId: bookingId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phone
        },
        payerMessage: 'RindaSeat Booking Payment',
        payeeNote: `Booking ${bookingId}`
      })
    });

    if (!response.ok) {
      console.error(`[MOMO] Request-to-pay failed: ${response.status}`);
      return {
        success: false,
        message: 'Failed to initiate payment request'
      };
    }

    return {
      success: true,
      transactionId,
      bookingId,
      status: 'pending',
      message: 'Payment request sent to customer'
    };
  } catch (error) {
    console.error(`[MOMO] Request-to-pay error: ${error.message}`);
    return {
      success: false,
      message: 'Payment request error'
    };
  }
};

const getMomoTransactionStatus = async (transactionId) => {
  if (!isMomoConfigured()) {
    return {
      success: false,
      message: 'MTN MoMo not configured'
    };
  }

  try {
    const endpoint = `${process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com'}/v1/requesttopay/${transactionId}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-Target-Environment': process.env.MTN_MOMO_TARGET_ENV || 'sandbox',
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY
      }
    });

    if (!response.ok) {
      console.error(`[MOMO] Status check failed: ${response.status}`);
      return {
        success: false,
        message: 'Failed to check transaction status'
      };
    }

    const data = await response.json();

    return {
      success: true,
      transactionId,
      status: data.status || 'unknown',
      financialTransactionId: data.financialTransactionId || null
    };
  } catch (error) {
    console.error(`[MOMO] Status check error: ${error.message}`);
    return {
      success: false,
      message: 'Status check error'
    };
  }
};

const verifyPayment = async (transactionId) => {
  return {
    success: true,
    transactionId,
    status: 'verified'
  };
};

module.exports = {
  initializePayment,
  createMomoRequestToPay,
  getMomoTransactionStatus,
  isPaymentProviderConfigured,
  verifyPayment,
  isMomoConfigured,
  isStripeConfigured
};

