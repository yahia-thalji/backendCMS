import { DataSource } from "typeorm";
import 'dotenv/config';

// قائمة بجميع كيانات (Entities) قاعدة البيانات
import { Assignment } from "../entities/assignment";
import { Assignmentsubmition } from "../entities/assignmentSubmition";
import { Brand } from "../entities/brand";
import { Cart } from "../entities/cart";
import { CartItem } from "../entities/cartItem";
import { Category } from "../entities/category";
import { Course } from "../entities/course";
import { Enrollments } from "../entities/enrollments";
import { Notification } from "../entities/notification";
import { Product } from "../entities/product";
import { Resources } from "../entities/resources";
import { Reviews } from "../entities/reviews";
import { Role } from "../entities/role";
import { User } from "../entities/user";

export const database = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // رابط قاعدة البيانات
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }  // SSL في الإنتاج فقط
    : false,
  logging: false, // تعطيل التسجيل (Logging) للأداء
  synchronize: process.env.NODE_ENV !== 'production', // عدم استخدام المزامنة التلقائية في الإنتاج
  schema: process.env.DATABASE_SCHEMA || 'public', // استخدام المخطط المحدد أو 'public' افتراضيًا
  entities: [
    Assignment,
    Assignmentsubmition,
    Brand,
    Cart,
    CartItem,
    Category,
    Course,
    Enrollments,
    Notification,
    Product,
    Resources,
    Reviews,
    Role,
    User
  ],
  // ملاحظة: تمت إزالة migrations لتبسيط المثال
});

/**
 * تهيئة قاعدة البيانات مع التعامل مع الأخطاء
 * @throws {Error} إذا فشل الاتصال بقاعدة البيانات
 */
export const initializeDB = async () => {
  if (!database.isInitialized) {
    try {
      await database.initialize();
      console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
    } catch (err: any) {
      console.error('❌ فشل تهيئة قاعدة البيانات:', err);
      throw err; // إعادة رمي الخطأ للتعامل معه في الكود الرئيسي
    }
  }
};