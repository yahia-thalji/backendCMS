import "reflect-metadata";
import express from 'express'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import ip from 'ip'
import { initializeDB } from './config/connectPgDB';   
import { errorHandler, notFound, validateUUIDParam } from './middleware/httpErorrs';


import authRoutes  from "./routes/authRoutes";
import userRoutes from './routes/userRoutes'
dotenv.config();

const app = express();
const port = process.env.APP_PORT ;
const IP = ip.address();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// api's:
app.use("/api/auth" , authRoutes );
app.use("/api/user",userRoutes)

app.use(notFound);
app.use(errorHandler);
app.use(validateUUIDParam);

app.listen(port,async()=>{
    console.log(`Server is running on http://${IP}:${port}`);
    await initializeDB();
})