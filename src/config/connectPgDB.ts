import { DataSource } from "typeorm";
import { User } from "../entities/user";
import { Role } from "../entities/role";
import { Enrollments } from "../entities/enrollments";
import { Assignmentsubmition } from "../entities/assignmentSubmition";
import { Cart } from "../entities/cart";
import { Notification } from "../entities/notification";
import { Reviews } from "../entities/reviews";
import { Resources } from "../entities/resources";
import { CartItem } from "../entities/cartItem";
import { Assignment } from "../entities/assignment";
import { Course } from "../entities/course";
import { Category } from "../entities/category";
import { Product } from "../entities/product";
import { Brand } from "../entities/brand";
import 'dotenv/config';

export const database = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: false,
    synchronize: true,
    schema: 'public',
    // entities: [__dirname + "/../entities/**/*.ts"],
    entities: [User , Role, Enrollments, Assignmentsubmition, Cart, Notification, Reviews, Resources, CartItem, Assignment, Course, Category, Product, Brand],
    migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],  

    // entities: [,],
});

export const initializeDB = async () => {
    try {
        await database.initialize();
        console.log('Database initialized successfully');
    } catch (err:any) {
        console.error('Database initialization failed:', err);
    }
};



// import { DataSource } from "typeorm";
// import 'dotenv/config';

// export const database = new DataSource({
//   type: 'postgres',
//   url: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production'
//     ? { rejectUnauthorized: false }
//     : false,
//   logging: false,
//   synchronize: process.env.NODE_ENV !== 'production',
//   schema: process.env.DATABASE_SCHEMA || 'public',
//   entities: [__dirname + "/../entities/**/*{.ts,.js}"],
//   migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],  // ← إضافة مسار المايجريشن
// });

// let isInitialized = false;

// export const initializeDB = async () => {
//   if (!isInitialized) {
//     try {
//       await database.initialize();
//       console.log('✅ Database initialized successfully');
//     } catch (err: any) {
//       console.error('❌ Database initialization failed:', err);
//       throw err;
//     }
//   }
//   return database;
// };
