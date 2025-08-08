import axios from 'axios';
import type { Request, Response, NextFunction } from 'express';

export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ reCAPTCHA validation skipped in development!');
    return true;
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set.');
      return false;
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const data = response.data;
    return data.success && data.score >= 0.3;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
};

export const verifyRecaptchaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.recaptchaToken;

  if (!token) {
    return res.status(400).json({ message: 'reCAPTCHA token is required.' });
  }

  const isValid = await verifyRecaptcha(token);

  if (!isValid) {
    return res.status(400).json({ message: 'Failed reCAPTCHA verification.' });
  }

  next();
};
