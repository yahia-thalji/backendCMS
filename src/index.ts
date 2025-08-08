import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
import path from "path";

import { initializeDB } from "./config/connectPgDB";
import { errorHandler, notFound, validateUUIDParam } from "./middleware/httpErorrs";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import notificationsRoutes from "./routes/notificationsRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import courseRoutes from "./routes/courseRoutes";
import brandRoutes from "./routes/brandRoutes";
import reviewRoutes from "./routes/reviewsRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import searchRoutes from "./routes/searchRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS مضبوط
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://frontendh-production.up.railway.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "cookie"],
  exposedHeaders: ["set-cookie"] 

}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ PostgreSQL Session Store
const PgSession = pgSession(session);
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(session({
  store: new PgSession({
    pool: pgPool,
    tableName: "session"
  }),
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

// Static resources
app.use("/resources", express.static(path.join(__dirname, "../resources")));

// APIs
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

// DB & Server start
(async () => {
  try {
    await initializeDB();
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize DB:", error);
    process.exit(1);
  }
})();
