import crypto from 'crypto';

/**
 * Generates a secure numeric OTP of specified length.
 * @param {Number} length 
 * @returns {String}
 */
const generateOTP = (length = 6) => {
  if (length <= 0) return '';
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  
  return otp;
};

export default generateOTP;
