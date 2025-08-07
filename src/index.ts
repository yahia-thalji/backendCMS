import "reflect-metadata";
import express from 'express'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from "cors";
import session from 'express-session';
import path from 'path';

import { initializeDB } from "./config/connectPgDB";   
import { errorHandler, notFound, validateUUIDParam } from './middleware/httpErorrs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
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

app.use('/resources', express.static(path.join(__dirname, '../resources')));

// Initialize DB and then start server
(async () => {
  try {
    await initializeDB();
    
    // Import routes after DB initialization
    const authRoutes = (await import("./routes/authRoutes")).default;
    const userRoutes = (await import("./routes/userRoutes")).default;
    const notificationsRoutes = (await import("./routes/notificationsRoutes")).default;
    const categoryRoutes = (await import("./routes/categoryRoutes")).default;
    const productRoutes = (await import("./routes/productRoutes")).default;
    const cartRoutes = (await import("./routes/cartRoutes")).default;
    const courseRoutes = (await import("./routes/courseRoutes")).default;
    const brandRoutes = (await import("./routes/brandRoutes")).default;
    const reviewRoutes = (await import("./routes/reviewsRoutes")).default;
    const dashboardRoutes = (await import("./routes/dashboardRoutes")).default;
    const searchRoutes = (await import("./routes/searchRoutes")).default;

    // Setup routes
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/notification", notificationsRoutes);
    app.use("/api/category", categoryRoutes);
    app.use("/api/product", productRoutes);
    app.use("/api/brand", brandRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/course", courseRoutes);
    app.use("/api/review", reviewRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/search", searchRoutes);

    app.use(notFound);
    app.use(errorHandler);
    app.use(validateUUIDParam);

    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize DB:', error);
    process.exit(1);
  }
})();