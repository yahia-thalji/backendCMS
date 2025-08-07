import { DataSource } from "typeorm";
import 'dotenv/config';

export const database = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  logging: false,
  synchronize: process.env.NODE_ENV !== 'production',
  schema: process.env.DATABASE_SCHEMA || 'public',
  entities: [__dirname + "/../entities/**/*.{js,ts}"],
  migrations: [__dirname + "/../migrations/**/*.{js,ts}"],
});

let isInitialized = false;

export const initializeDB = async () => {
  if (!isInitialized) {
    try {
      await database.initialize();
      isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (err: any) {
      console.error('❌ Database initialization failed:', err);
      throw err;
    }
  }
  return database;
};