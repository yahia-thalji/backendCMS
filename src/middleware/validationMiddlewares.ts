import { validationResult } from "express-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const validateInputs = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    return next();
};


// Middleware للتحقق من صحة البريد الإلكتروني
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Middleware للتحقق من قوة كلمة المرور
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
        return { valid: false, message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل" };
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return { 
            valid: false, 
            message: "يجب أن تحتوي كلمة المرور على حرف كبير على الأقل، حرف صغير، ورقم" 
        };
    }

    return { valid: true };
};

// Middleware للتحقق من صحة رقم الهاتف
export const validatePhoneNumber = (phoneNumber: string): boolean => {
    return phoneNumber.length >= 9 && phoneNumber.length <= 12;
};