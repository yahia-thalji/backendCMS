import { RequestHandler } from "express";
import { Course } from "../entities/course";


export const createCourse:RequestHandler = async (req , res):Promise<any> => {
    try {
        const {courseTitle,description ,startDate ,duration ,instructor ,price,newPrice ,status ,meetingLink}=req.body;
        if(!courseTitle||! description ||! startDate ||! duration ||! instructor ||! price ||! status ||! meetingLink){
            return res.status(400).json({message:"missing Fields"})
        }
        if (newPrice && newPrice >= price) {
            return res.status(400).json({ message: "New price must be lower than the original price" });
        }
        if(price<0){
            return res.status(403).json({message:"The Price Must Be Positive Number"});
        }
        const createCourse =await Course.create({
            courseTitle,
            description ,
            startDate ,
            duration ,
            instructor ,
            price,
            newPrice :newPrice || null,
            status ,
            meetingLink
        }).save();
        return res.status(201).json(createCourse)
    } catch (error:any) {
        console.log("Error in createCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const updateCourse:RequestHandler = async (req , res):Promise<any> => {
    try {
        const courseId:any = req.params.courseId;
        const course = await Course.findOne({where:{courseId:courseId}});
        if(!course){
            return res.status(404).json({message:"Not Found"});
        }
        
        const {courseTitle,description ,startDate ,duration ,instructor ,price,newPrice ,status ,meetingLink}=req.body;

            if (newPrice && newPrice >= price) {
                return res.status(400).json({ message: "New price must be lower than the original price" });
            }
            if(price<0){
                return res.status(403).json({message:"The Price Must Be Positive Number"});
            }

            if(courseTitle) {course.courseTitle=courseTitle || course.courseTitle;   }

            if(description) {course.description=description || course.description;   }

            if(startDate)   {course.startDate=startDate     || course.startDate;     }

            if(duration)    {course.duration=duration       || course.duration;      }

            if(instructor)  {course.instructor=instructor   || course.instructor;    }

            if(price)       {course.price=price             || course.price;         }

            if(newPrice)    {course.newPrice=newPrice       || course.newPrice;      }

            if(status)      {course.status=status           || course.status;        }

            if(meetingLink) {course.meetingLink=meetingLink || course.meetingLink;   }

        await course.save();
        return res.status(200).json({
            message:"Updated Successfully",
            courseUpdate:course
        })
    } catch (error:any) {
        console.log("Error in updateCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deleteCourse:RequestHandler = async (req , res):Promise<any> => {
    try {
        const courseId:any = req.params.courseId;
        const course = await Course.findOne({where:{courseId:courseId}});
        if(!course){
            return res.status(404).json({message:"Not Found"});
        }
        await course.remove();
        return res.status(200).json({message:"Deleted Successfully"});
    } catch (error:any) {
        console.log("Error in deleteCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getCourse:RequestHandler = async (req , res):Promise<any> => {
    try {
        const courseId:any = req.params.courseId;
        const course = await Course.findOne({where:{courseId:courseId}});
        if(!course){
            return res.status(404).json({message:"Not Found"});
        }
        return res.status(200).json(course);
    } catch (error:any) {
        console.log("Error in getCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
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
