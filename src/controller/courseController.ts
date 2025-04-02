import { RequestHandler } from "express";
import { Course } from "../entities/course";

export const getAllCourses: RequestHandler = async (req, res): Promise<any> => {
    try {
        const courses = await Course.find();

        if (courses.length === 0) {
            return res.status(404).json({ message: "Sorry, no courses available yet." });
        }

        return res.status(200).json(courses);
    } catch (error: any) {
        console.error("Error in getAllCourses controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
