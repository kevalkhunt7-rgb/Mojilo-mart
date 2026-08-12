import mongoSanitize from 'express-mongo-sanitize';

const mongoSanitizer = mongoSanitize();

/**
 * Sanitizes input to prevent NoSQL query injection
 */
export const sanitizeData = (req, res, next) => {
  // Express mongo sanitize middleware
  mongoSanitizer(req, res, () => {
    // Custom clean utility for sanitizing text input from basic HTML tags (anti-XSS)
    const cleanObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Replace dangerous tags
          obj[key] = obj[key]
            .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/<\/?[^>]+(>|$)/g, '');
        } else if (typeof obj[key] === 'object') {
          cleanObject(obj[key]);
        }
      }
    };

    cleanObject(req.body);
    cleanObject(req.query);
    cleanObject(req.params);
    next();
  });
};
