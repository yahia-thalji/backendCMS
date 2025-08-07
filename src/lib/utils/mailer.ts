// mailer.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetCode = async (email: string, code: string) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "رمز استعادة كلمة المرور",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #4A90E2; text-align: center;">استعادة كلمة المرور</h2>
          <p style="font-size: 16px; color: #333;">مرحباً،</p>
          <p style="font-size: 16px; color: #333;">
            لقد طلبت استعادة كلمة المرور الخاصة بك. الرجاء استخدام الرمز التالي لإتمام العملية:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; background-color: #4A90E2; color: white; font-size: 22px; padding: 10px 20px; border-radius: 6px; letter-spacing: 2px;">
              ${code}
            </span>
          </div>
          <p style="font-size: 14px; color: #666;">
            إذا لم تقم بطلب استعادة كلمة المرور، يمكنك تجاهل هذه الرسالة.
          </p>
          <p style="font-size: 14px; color: #aaa; text-align: center; margin-top: 30px;">
            مع تحياتي،<br>
            <span style="color: #4A90E2; font-weight: bold; font-size: 16px;">Haneen</span>
          </p>
        </div>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  