import { DataSource } from "typeorm";
import 'dotenv/config';

export const database = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // رابط قاعدة البيانات
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }  // السماح للاتصال المشفر في الإنتاج
    : false,
  logging: false,
  synchronize: process.env.NODE_ENV !== 'production', // false في الإنتاج
  schema: process.env.DATABASE_SCHEMA || 'public',
  entities: [__dirname + "/entities/**/*.ts"],
  migrations: [__dirname + "/migrations/**/*.ts"],
});

// initializeDB تعيد رمي الخطأ لتتمكن من التعامل معه في نقطة الاستدعاء
export const initializeDB = async () => {
  if (!database.isInitialized) {
    try {
      await database.initialize();
      console.log('✅ Database initialized successfully');
    } catch (err: any) {
      console.error('❌ Database initialization failed:', err);
      throw err;  // مهم ترمي الخطأ للـ caller
    }
  }
};
