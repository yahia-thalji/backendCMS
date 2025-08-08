import { Request, Response, NextFunction } from "express";
// import rateLimit from "express-rate-limit";
// import helmet from "helmet";
// import csrf from "csurf";

import axios from "axios";

// export const securityHeaders = helmet();


// export const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 دقيقة
//   max: 100, // عدد الطلبات القصوى
// });

// const staticFilesHelmet = helmet({
//   contentSecurityPolicy: false,
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// });

// const mainAppHelmet = helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       imgSrc: ["'self'", "data:", "blob:", "https://*"],
//       connectSrc: ["'self'", "https://*"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       objectSrc: ["'none'"],
//       frameSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//     },
//   },
//   frameguard: { action: 'deny' },
//   hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
//   referrerPolicy: { policy: "no-referrer" },
// });

// export const applyBasicSecurity = [
//   (req: Request, res: Response, next: NextFunction) => {
//     if (req.path.startsWith('/resources')) {
//       staticFilesHelmet(req, res, next);
//     } else {
//       mainAppHelmet(req, res, next);
//     }
//   },
// ];

// export const csrfProtection = csrf({ cookie: true });


// export const verifyRecaptcha = async (token: string) => {
//     if (process.env.NODE_ENV === 'development') {
//         console.warn('⚠️ reCAPTCHA validation skipped in development!');
//         return true;
//       }

//   try {
//     const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//     const response = await fetch(
//       `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
//       { method: 'POST' }
//     );
    
//     const data = await response.json();
//     return data.success && data.score >= 0.3;
//   } catch (error) {
//     console.error('Error verifying reCAPTCHA:', error);
//     return false;
//   }
// };


// export const verifyRecaptchaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.body.recaptchaToken;

//     if (!token) {
//       return res.status(400).json({ message: "reCAPTCHA token is required." });
//     }

//     const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//     const response = await axios.post(
//       `https://www.google.com/recaptcha/api/siteverify`,
//       null,
//       {
//         params: {
//           secret: secretKey,
//           response: token,
//         },
//       }
//     );

//     const data = response.data;

//     if (!data.success || data.score < 0.3) {
//       return res.status(400).json({ message: "Failed reCAPTCHA verification." });
//     }

//     next(); // Next to move to the next middleware or route handler
//   } catch (error) {
//     console.error("Error verifying reCAPTCHA:", error);
//     res.status(500).json({ message: "Error verifying reCAPTCHA." });
//   }
// };
