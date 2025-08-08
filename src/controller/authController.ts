import { RequestHandler } from "express";
import { User } from "../entities/user";
import bcrypt from "bcrypt";
import { Role } from "../entities/role";
import { generateToken } from "../lib/utils/generateToken";
import { createNotification, getAdminUsers } from "./notificationHelpers";
import { sendResetCode } from "../lib/utils/mailer";
import crypto from 'crypto';
import {
    validateEmail,
    validatePassword,
    validatePhoneNumber
} from "../middleware/validationMiddlewares";

// Helper function لتطهير المدخلات
const sanitizeInput = (input: string): string => {
    return input.replace(/<[^>]*>?/gm, '');
};

// Helper function لتأخير الاستجابة
const delayResponse = async (min: number, max: number) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
};

export const signup: RequestHandler = async (req, res): Promise<any> => {
    try {
        const userData = req.body;
        
        const { firstName, lastName, email, phoneNumber, address, gender, dateOfBirth, password, confirmPassword } = userData;
        
        // التحقق من المدخلات المطلوبة
        const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'gender', 'dateOfBirth', 'password'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `الحقول التالية مطلوبة: ${missingFields.join(', ')}` 
            });
        }

        // التحقق من صحة المدخلات
        if (!validateEmail(email)) {
            return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صالحة" });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'كلمات المرور غير متطابقة' });
        }

        if (!validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: "يجب أن يتكون رقم الهاتف من 9 إلى 12 رقماً" });
        }

        // التحقق من القيم المسموحة للجنس
        const allowedGenders = ['male', 'female'];
        if (!allowedGenders.includes(gender.toLowerCase())) {
            return res.status(400).json({ error: "قيمة الجنس غير صالحة" });
        }

        // التحقق من عدم تكرار البريد الإلكتروني ورقم الهاتف
        const [existingEmail, existingPhoneNumber] = await Promise.all([
            User.findOne({ where: { email } }),
            User.findOne({ where: { phoneNumber } })
        ]);

        if (existingEmail) {
            return res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
        }

        if (existingPhoneNumber) {
            return res.status(400).json({ error: "رقم الهاتف مسجل مسبقاً" });
        }

        // إنشاء المستخدم
        const hashedPassword = await bcrypt.hash(password, 10);
        let role = await Role.findOne({ where: { roleName: 'user' } });
        
        if (!role) {
            role = Role.create({ roleName: 'user' });
            role = await role.save();
        }

        const dob = new Date(dateOfBirth);
        const createUser = User.create({
            firstName: sanitizeInput(firstName),
            lastName: sanitizeInput(lastName),
            email: sanitizeInput(email),
            phoneNumber: sanitizeInput(phoneNumber),
            address: sanitizeInput(address),
            gender: sanitizeInput(gender) as "male" | "female",
            dateOfBirth: dob,
            password: hashedPassword,
            Role: role,
            loginAttempts: 0,
            accountLockedUntil: null
        });

        await createUser.save();

        // إرسال الإشعارات
        const adminUsers = await getAdminUsers();
        for (const admin of adminUsers) {
            await createNotification(
                "مستخدم جديد",
                "user_registration",
                createUser,
                admin
            );
        }

        await createNotification(
            "مرحبا بك في منصتنا",
            "ترحيب",
            adminUsers[0],
            createUser
        );

        return res.status(201).json({ message: "تم تسجيل المستخدم بنجاح" });
    } catch (error: any) {
        console.error("Error in signup controller", error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
};

export const login: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "الرجاء تقديم البريد الإلكتروني وكلمة المرور" });
        }

        const user = await User.findOne({ 
            where: { email },
            relations: ["Role"]
        });

        if (!user) {
            return res.status(401).json({ error: "بيانات الاعتماد غير صحيحة" });
        }

        // التحقق من حالة القفل
        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
            return res.status(403).json({ 
                error: `الحساب مقفل حتى ${user.accountLockedUntil.toLocaleTimeString()}`
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                await user.save();
                return res.status(403).json({ 
                    error: "تم قفل الحساب مؤقتاً بسبب كثرة المحاولات الفاشلة"
                });
            }
            await user.save();
            return res.status(401).json({ error: "بيانات الاعتماد غير صحيحة" });
        }

        // إعادة تعيين المحاولات عند النجاح
        user.loginAttempts = 0;
        user.accountLockedUntil = null;
        await user.save();

        // إنشاء وتحديث التوكن
        const token = await generateToken(user.UserID);
        
        // إعدادات الكوكي المحسنة
        // res.cookie("authToken", token, {
        //     maxAge: 15 * 24 * 60 * 60 * 1000,
        //     httpOnly: true,
        //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        //     secure: process.env.NODE_ENV === "production",
        //     domain: process.env.NODE_ENV === "development" ? "localhost" : process.env.COOKIE_DOMAIN,
        //     path: "/"
        // });
        res.cookie("authToken", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 يوم
    httpOnly: true,
    sameSite: "none", // للسماح بالكوكي عبر الدومينات
    secure: true,     // مطلوب لأن Railway يعمل HTTPS
    domain: "frontendh-production.up.railway.app", // أو اتركه فاضي إذا أردت أن يكون خاص بالباك فقط
    path: "/"
});


        res.status(200).json({
            success: true,
            user: {
                id: user.UserID,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.Role?.roleName
            }
        });
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
};

export const logout: RequestHandler = async (req, res): Promise<any> => {
    try {
        res.clearCookie("authToken", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            domain: process.env.NODE_ENV === "development" ? "localhost" : process.env.COOKIE_DOMAIN,
            path: "/"
        });

        res.status(200).json({ success: true, message: "تم تسجيل الخروج بنجاح" });
    } catch (error: any) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
};

export const getMe: RequestHandler = async (req, res): Promise<any> => {
    try {
        const user = (req as any).user;
        const userData = await User.findOne({
            where: { UserID: user.userId },
            relations: ["Role", "UserProfilePicture"],
            select: [
                "UserID",
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "address",
                "gender",
                "dateOfBirth",
                "createdAt"
            ]
        });

        if (!userData) {
            return res.status(404).json({ error: "المستخدم غير موجود" });
        }

        res.status(200).json({
            ...userData,
            role: userData.Role?.roleName
        });
    } catch (error: any) {
        console.error("Error in getMe controller", error.message);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
};

const generateResetCode = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

export const requestPasswordReset: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "الرجاء إدخال البريد الإلكتروني" });
        }

        // تأخير للحد من هجمات enumeration
        await delayResponse(500, 1000);

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(200).json({ message: "إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة" });
        }

        // الحد من طلبات إعادة التعيين
        if (user.resetCodeAttempts >= 3) {
            return res.status(429).json({ 
                error: "لقد تجاوزت الحد المسموح من الطلبات. الرجاء المحاولة لاحقاً." 
            });
        }

        const code = generateResetCode();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // صلاحية 10 دقائق

        user.resetCode = code;
        user.resetCodeExpires = expires;
        user.resetCodeAttempts = (user.resetCodeAttempts || 0) + 1;
        await user.save();

        await sendResetCode(email, code);

        res.status(200).json({ message: "إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة" });
    } catch (error: any) {
        console.error("Error in requestPasswordReset controller", error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
};

export const verifyResetCode: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ error: "الرجاء إدخال البريد الإلكتروني والرمز" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user || user.resetCode !== code) {
            return res.status(400).json({ error: "رمز التحقق غير صحيح" });
        }

        if (user.resetCodeExpires && user.resetCodeExpires < new Date()) {
            return res.status(400).json({ error: "انتهت صلاحية رمز التحقق" });
        }

        res.status(200).json({ 
            message: "تم التحقق من الرمز بنجاح",
            email,
            code
        });
    } catch (error: any) {
        console.error("Error in verifyResetCode controller", error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
};

export const resetPassword: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { email, code, newPassword, confirmPassword } = req.body;
        
        if (!email || !code || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: "الرجاء إدخال جميع الحقول المطلوبة" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "كلمتا المرور غير متطابقتين" });
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }

        const user = await User.findOne({ where: { email } });
        if (!user || user.resetCode !== code) {
            return res.status(400).json({ error: "رمز التحقق غير صحيح" });
        }

        if (user.resetCodeExpires && user.resetCodeExpires < new Date()) {
            return res.status(400).json({ error: "انتهت صلاحية رمز التحقق" });
        }

        // التحقق من عدم استخدام كلمة المرور القديمة
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: "لا يمكن استخدام كلمة المرور القديمة" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpires = null;
        user.resetCodeAttempts = 0;
        await user.save();

        // إرسال إشعار بتغيير كلمة المرور
        await createNotification(
            "تم تغيير كلمة المرور",
            "password_changed",
            user,
            user
        );

        res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error: any) {
        console.error("Error in resetPassword controller", error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
};