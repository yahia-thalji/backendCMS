import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/utils/generateToken";

export const IsAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies?.authToken || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

        if (!token) {
            return res.status(401).json({ message: "No token provided" }); // ✅ أضف return
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid or expired token" }); // ✅ أضف return
        }

        (req as any).user = decoded;
        // console.log((req as any).user);
        next();
    } catch (error: any) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" }); // ✅ أضف return
    }
};


export const isAuthorized = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        await IsAuthenticated(req, res, async () => {
            const user = (req as any).user;
            console.log(user);
            if (!user || !user.userId) {
                return res.status(403).json({ message: "User data missing" }); // ✅ أضف return
            }

            if (user.userId === req.params.id || user.role === "admin") {
                return next(); // ✅ أضف return
            }

            return res.status(403).json({ message: "You are not allowed" }); // ✅ أضف return
        });
    } catch (error: any) {
        console.error("Authorization error:", error.message);
        return res.status(500).json({ message: "Internal server error" }); // ✅ أضف return
    }
};



