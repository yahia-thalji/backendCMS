import "reflect-metadata";
import express from 'express'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from "cors";
import session from 'express-session';

import ip from 'ip'
import { initializeDB } from './config/connectPgDB';   
import { errorHandler, notFound, validateUUIDParam } from './middleware/httpErorrs';


import authRoutes  from "./routes/authRoutes";
import userRoutes from './routes/userRoutes'
import notificationsRoutes from "./routes/notificationsRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import courseRoutes from "./routes/courseRoutes";
dotenv.config();

const app = express();
const port = process.env.APP_PORT ;
const IP = ip.address();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  }));
  app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'cookie'],
}));

// api's:
app.use("/api/auth" , authRoutes );
app.use("/api/user",userRoutes);
app.use("/api/notification",notificationsRoutes);
app.use("/api/category",categoryRoutes);
app.use("/api/product",productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/course",courseRoutes);

app.use(notFound);
app.use(errorHandler);
app.use(validateUUIDParam);

app.listen(port,async()=>{
    console.log(`Server is running on http://${IP}:${port}`);
    await initializeDB();
})