// src/data-source.ts
import { DataSource } from "typeorm";
import 'dotenv/config';

export const database = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // استخدام الرابط الموحد
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  logging: false,
  synchronize: true, // استخدم false في بيئة الإنتاج لتجنب تغييرات غير متوقعة
  schema: process.env.DATABASE_SCHEMA || 'public', // إذا كنت تستخدم schema معينة
  entities: [__dirname + "/entities/**/*.ts"],
  migrations: [__dirname + "/migrations/**/*.ts"],
});

export const initializeDB = async () => {
  try {
    await database.initialize();
    console.log('Database initialized successfully');
  } catch (err: any) {
    console.error('Database initialization failed:', err);
  }
};
