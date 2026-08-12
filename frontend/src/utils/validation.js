/**
 * Utility functions for validating Email and Phone Numbers across the frontend.
 */

/**
 * Validates whether a string is a properly formatted email address.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates whether a string is a valid 10-digit phone number.
 * Supports standard 10-digit numbers and Indian mobile numbers (starting with 6-9).
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return /^[6-9]\d{9}$/.test(digitsOnly) || /^\d{10}$/.test(digitsOnly);
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(digitsOnly);
  }
  return false;
};

/**
 * Formats a phone input string to allow only numeric digits up to 10 digits max.
 * @param {string} val 
 * @returns {string}
 */
export const sanitizePhoneInput = (val) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  return digits.slice(0, 10);
};
