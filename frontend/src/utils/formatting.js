// @ts-nocheck
export const formatPrice = (price) => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatTime = (time) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(time));
};

export const formatDateFull = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const calculateDuration = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diff = endTime - startTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^(\+250|0)?[1-9]\d{8}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const truncateText = (text, length) => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};
