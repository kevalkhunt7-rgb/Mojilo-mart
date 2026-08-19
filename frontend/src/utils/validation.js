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

/**
 * Validates password criteria:
 * - Minimum Length: 8 characters or more
 * - Character Variety: At least one uppercase letter (A-Z) and one lowercase letter (a-z)
 * - Numbers: At least one numeric digit (0-9)
 * - Special Symbols: At least one special character (e.g. !@#$%^&*)
 * @param {string} password 
 * @returns {object} { isValid, minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar, errors }
 */
export const validatePassword = (password = '') => {
  const str = password || '';
  const minLength = str.length >= 8;
  const hasUppercase = /[A-Z]/.test(str);
  const hasLowercase = /[a-z]/.test(str);
  const hasNumber = /[0-9]/.test(str);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(str);

  const errors = [];
  if (!minLength) errors.push('At least 8 characters long');
  if (!hasUppercase) errors.push('At least one uppercase letter (A–Z)');
  if (!hasLowercase) errors.push('At least one lowercase letter (a–z)');
  if (!hasNumber) errors.push('At least one numeric digit (0–9)');
  if (!hasSpecialChar) errors.push('At least one special character (!@#$%^&*)');

  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  return {
    isValid,
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    errors
  };
};

export const isValidPassword = (password) => {
  return validatePassword(password).isValid;
};

