import "reflect-metadata";
import express from 'express'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from "cors";
import session from 'express-session';

// import ip from 'ip';
import path from 'path';

import { initializeDB } from "./config/connectPgDB";   
import { errorHandler, notFound, validateUUIDParam } from './middleware/httpErorrs';


import authRoutes  from "./routes/authRoutes";
import userRoutes from './routes/userRoutes'
import notificationsRoutes from "./routes/notificationsRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import courseRoutes from "./routes/courseRoutes";
import brandRoutes from "./routes/brandRoutes";
import reviewRoutes from "./routes/reviewsRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import searchRoutes  from "./routes/searchRoutes";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
// const IP = ip.address();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  }));

  
app.use(cors({
  origin: ['http://localhost:3001', 'https://cpsystem-production.up.railway.app'], // استبدل بالدومين الفعلي
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'cookie'],
}));

// app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/resources', express.static(path.join(__dirname, '../resources')));

// api's:
app.use("/api/auth" , authRoutes );
app.use("/api/user",userRoutes);
app.use("/api/notification",notificationsRoutes);
app.use("/api/category",categoryRoutes);
app.use("/api/product",productRoutes);
app.use("/api/brand",brandRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/course",courseRoutes);
app.use("/api/review",reviewRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/search", searchRoutes); 

app.use(notFound);
app.use(errorHandler);
app.use(validateUUIDParam);

(async () => {
  try {
    await initializeDB(); 
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize DB:', error);
    process.exit(1);  // اغلق التطبيق لو فشل الاتصال
  }
})();
