/**
 * Formats a number to currency format (defaults to INR)
 * @param {Number} amount 
 * @param {String} currency 
 * @returns {String}
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const options = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  };
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', options).format(amount);
  }
  return new Intl.NumberFormat('en-US', options).format(amount);
};

/**
 * Basic exchange rate utility
 */
export const convertCurrency = (amount, from = 'INR', to = 'USD', rate = 0.012) => {
  if (from === to) return amount;
  return amount * rate;
};
