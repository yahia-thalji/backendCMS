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

import currencyRouter from "./routes/currencyRoutes";
import invoiceRouter from "./routes/invoiceRoutes";
import locationRouter from "./routes/locationRoutes";
import internalTransferRouter from "./routes/internalTransferRoutes";
import itemRouter from "./routes/itemRoutes";
import supplierRouter from "./routes/supplierRoutes";
import shipmentRouter from "./routes/shipmentRoutes";
import dashboardRouter from "./routes/dashboardRoutes";
import reportRouter from "./routes/reportsRoutes";



dotenv.config();

const app = express();
const port = process.env.PORT || 8080;


app.use(cors({
  origin: process.env.FRONTEND_URL || "frontendcms-production.up.railway.app",
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
app.use("/api/currencies", currencyRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/locations", locationRouter);
app.use("/api/internalTransfers", internalTransferRouter);
app.use("/api/items", itemRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/shipments", shipmentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportRouter);


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
  