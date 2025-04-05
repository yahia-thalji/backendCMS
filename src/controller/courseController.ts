import { RequestHandler } from "express";
import { Course } from "../entities/course";
import { Product } from "../entities/product";
import { User } from "../entities/user";
import { Enrollments } from "../entities/enrollments";
import { Resources } from "../entities/resources";
import { Assignment } from "../entities/assignment";
import { Assignmentsubmition } from "../entities/assignmentSubmition";


export const createCourse:RequestHandler = async (req , res):Promise<any> => {
    try {
        const {courseTitle,description ,startDate ,duration ,instructor ,price,newPrice ,status ,meetingLink}=req.body;
        if(!courseTitle||! description ||! startDate ||! duration ||! instructor ||! price ||! status ||! meetingLink){
            return res.status(400).json({message:"missing Fields"})
        }
        if (!["open", "close"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        if (newPrice && newPrice >= price) {
            return res.status(400).json({ message: "New price must be lower than the original price" });
        }
        if(price<0){
            return res.status(403).json({message:"The Price Must Be Positive Number"});
        }
        const startdate= new Date(startDate);

                // Safely access req.files and handle cases where it might be undefined
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const images = files?.['images'] ?? [];
        // Check if both arrays are empty
        if (images.length === 0) {
            return res.status(400).send({ message: "Please provide one image " });
        }
        const createCourse =await Course.create({
            courseTitle,
            description ,
            startDate:startdate ,
            duration ,
            instructor ,
            price,
            newPrice :newPrice || null,
            status ,
            meetingLink
        }).save();

        for (const image of images) {
            const resource = Resources.create({
                entityName: image.filename,
                filePath: image.path,
                fileType: image.mimetype,
                course: createCourse,
            });
            await resource.save();
        }

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

            if(status){
              if (!["open", "close"].includes(status)) {
               return res.status(400).json({ message: "Invalid status value" });
              }
            }
            if (newPrice && newPrice >= price) {
                return res.status(400).json({ message: "New price must be lower than the original price" });
            }
            if(price<0){
                return res.status(403).json({message:"The Price Must Be Positive Number"});
            }
            const startdate= new Date(startDate);

            if(courseTitle) {course.courseTitle=courseTitle || course.courseTitle;   }

            if(description) {course.description=description || course.description;   }

            if(startDate)   {course.startDate=startdate     || course.startDate;     }

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
        const course = await Course.findOne({where:{courseId:courseId},relations:['resources']});
        if(!course){
            return res.status(404).json({message:"Not Found"});
        }
        return res.status(200).json(course);
    } catch (error:any) {
        console.log("Error in getCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
export const getAll: RequestHandler = async (req, res):Promise<any> => {
    try {
        const courses = await Course.find({relations:['resources']});
        if (!courses.length) {
            return res.status(404).json({ message: "Sorry, no courses available yet." });
        }

        return res.status(200).json(courses);
    } catch (error:any) {
        console.error("Error in getAllCourses controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const subscribeToCourse:RequestHandler = async (req , res):Promise<any> => {
    try {

        const user = (req as any).user;
        const UserID: any = user.userId;
    
        const userIsExist = await User.findOne({ where: { UserID: UserID } });
        if (!userIsExist) {
            return res.status(400).json({ message: "User not found" });
        }

        const courseId:any = req.params.courseId;
        if(!courseId){
            return res.status(400).json({ error: "Missing course ID in request parameters" });
        }
        const course = await Course.findOneBy({courseId});
        if(!course){
            return res.status(404).json({message:"Not found course"});
        }

        const createEnrollment= Enrollments.create({
            user:userIsExist,
            course:course
        });
         await createEnrollment.save();
        return res.status(201).json({
            message:"You have successfully subscribed.",
            Enrollment:createEnrollment,
        })
    } catch (error:any) {
        console.log("Error in subscribeToCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getEnrollments:RequestHandler = async (req , res):Promise<any> => {
    try {
        const enrollments = await Enrollments.find({relations:['user','resources']});
        if(!enrollments){
            return res.status(404).json({message:"No Enrollments"});
        }
        return res.status(201).json(enrollments);
    } catch (error:any) {
        console.log("Error in getEnrollments controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getMyEnrollment: RequestHandler = async (req, res): Promise<any> => {
    try {
        const user = (req as any).user;
        const userId: string = user.userId;
    
        const userIsExist = await User.findOne({ where: { UserID: userId } }); 
        if (!userIsExist) {
            return res.status(400).json({ message: "User not found" });
        }
console.log(userIsExist);
        const myEnrollment = await Enrollments.find({
            where: { user: { UserID: userId }, status:"accept"}, 
            relations: ['user' ,'course.resources'],
        });

        if (myEnrollment.length === 0) {
            return res.status(404).json({ message: "No enrollments found" });
        }

        return res.status(200).json(myEnrollment);
    } catch (error: any) {
        console.log("Error in getMyEnrollment controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const acceptOrRejected:RequestHandler = async (req , res):Promise<any> => {
    try {
        // const user = (req as any).user;
        // const UserID: any = user.userId;
    
        // const userIsExist = await User.findOne({ where: { UserID: UserID } });
        // if (!userIsExist) {
        //     return res.status(400).json({ message: "User not found" });
        // }


        const {enrollmentId , status} = req.body;
            if (!["accept", "rejected"].includes(status)) {
             return res.status(400).json({ message: "Invalid status value" });
            }
            if(!enrollmentId){
                return res.status(400).json({message:"please enter the id"})
            }
        const enrollment = await Enrollments.findOne({where:{myCourseId:enrollmentId} ,relations:['user']});
        if(!enrollment){
            return res.status(404).json({message:"No Found"});
        }

        if (status === "rejected") {
            enrollment.status = "rejected";
            await enrollment.save();
            return res.status(422).json({ message: "Your enrollment has been rejected. Please try again later." });
        }
        

        enrollment.status="accept";
        await enrollment.save();
        return res.status(201).json({message:"You have been 'accepted' into the course."})



    } catch (error:any) {
        console.log("Error in acceptOrRejected controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}



export const addRecords:RequestHandler = async (req , res):Promise<any> => {
    try {
        const courseId:any = req.params.courseId;
        if(!courseId){
            return res.status(400).json({message:"please enter the course id"});

        }
            const course = await Course.findOne({where:{courseId:courseId}});
            if(!course){
                return res.status(404).json({message:"Not Found Course !"})
            }

            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

            // Initialize images and videos as empty arrays if they do not exist
            const videos = files?.['videos'] ?? [];
    
            // Check if both arrays are empty
            if ( videos.length === 0) {
                return res.status(400).send({ message: "Please provide at least one video" });
            }
            const videoResources = await Promise.all(videos.map(async (video) => {
                const resource = Resources.create({
                    entityName: video.filename,
                    filePath: video.path,
                    fileType: video.mimetype,
                    course: course // Associate course with resource
                });
                return await resource.save();
            }));
            await course.save();
            return res.status(201).json(course);
    } catch (error:any) {
        console.log("Error in addRecordsAndFiles controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getRecords:RequestHandler = async (req , res):Promise<any> => {
    try {
        const courseId :any = req.params.courseId;
        const courseRecords = await Resources.find({where:{course:{courseId:courseId}}})
        if(!courseRecords){
            return res.status(404).json({message:"No Records Yet"});
        }
        return res.status(200).json(courseRecords);
    } catch (error:any) {
        console.log("Error in getRecordsAndFiles controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const updateRecord: RequestHandler = async (req, res): Promise<any> => {
    try {
        const resourceId: any = req.params.resourceId;

        if (!resourceId) {
            return res.status(400).json({ message: "Please provide the resource ID" });
        }

        const resource = await Resources.findOne({
            where: { resourceID: resourceId },
            relations: ['course']
        });

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        // استقبال الملف الجديد من req.files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const videos = files?.['videos'] ?? [];

        if (videos.length === 0) {
            return res.status(400).json({ message: "Please provide a new video file" });
        }

        const newVideo = videos[0];

        // حذف الملف القديم من السيرفر
        const fs = require('fs');
        if (fs.existsSync(resource.filePath)) {
            fs.unlinkSync(resource.filePath);
        }

        // تحديث بيانات الـ resource
        resource.entityName = newVideo.filename;
        resource.filePath = newVideo.path;
        resource.fileType = newVideo.mimetype;

        await resource.save();

        return res.status(200).json({
            message: "Resource updated successfully",
            data: resource
        });

    } catch (error: any) {
        console.log("Error in updateRecord controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const deleteRecord: RequestHandler = async (req, res): Promise<any> => {
    try {
        const resourceId: any = req.params.resourceId;

        if (!resourceId) {
            return res.status(400).json({ message: "Please provide the resource ID" });
        }

        const resource = await Resources.findOne({ where: { resourceID: resourceId }, relations: ["course"] });

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        // Remove file from disk (اختياري إذا كنت بدك تحذف الملف من السيرفر)
        const fs = require('fs');
        if (fs.existsSync(resource.filePath)) {
            fs.unlinkSync(resource.filePath);
        }

        await resource.remove(); // حذف الريسورس من قاعدة البيانات

        return res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error: any) {
        console.log("Error in deleteRecord controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}




export const AddAssignment:RequestHandler = async (req , res):Promise<any> => {
    try {
        const courseId :any= req.params.courseId;
        if(!courseId){
            return res.status(400).json({ message: "Please provide the course ID" });
        }
        const course = await Course.findOne({where:{courseId:courseId}});
        if(!course){
            return res.status(404).json({message:"Not Found Course"});
        }
        const {title,subject}=req.body;
        if(!title || !subject){
            return res.status(400).json({error:"please fill all fields"});
        }
        const addAssignment = Assignment.create({
            title,
            subject,
            course
        });
        await addAssignment.save();
        return res.status(201).json(addAssignment);
    } catch (error:any) {
        console.log("Error in AddAssignment controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const editAssignment:RequestHandler = async (req , res):Promise<any> => {
    try {
        const assignmentId :any = req.params.assignmentId;
        if(!assignmentId){
            return res.status(400).json({ message: "Please provide the assignment ID" })
        }
        const editAssignment = await Assignment.findOne({where:{assignmentId:assignmentId}});
        if(!editAssignment){
            return res.status(404).json({message:"Not Found Assignment"})
        }

        const {title , subject}=req.body;
        if(title )     {editAssignment.title=title     || editAssignment.title          }
        if(subject) {editAssignment.subject=subject || editAssignment.subject        }

        await editAssignment.save();
        return res.status(201).json(editAssignment);
    } catch (error:any) {
        console.log("Error in editAssignment controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const deleteAssignment:RequestHandler = async (req , res):Promise<any> => {
    try {
        const assignmentId :any = req.params.assignmentId;
        if(!assignmentId){
            return res.status(400).json({ message: "Please provide the assignment ID" })
        }
        const assignment = await Assignment.findOne({where:{assignmentId:assignmentId}});
        if(!assignment){
            return res.status(404).json({message:"Not Found Assignment"})
        }

        await assignment.remove();

        return res.status(200).json({message:"The assignment has been removed."})

    } catch (error:any) {
        console.log("Error in deleteAssignment controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getAllAssignmentsForCourse:RequestHandler = async (req , res):Promise<any> => {
    try {
        const courseId :any= req.params.courseId;
        if(!courseId){
            return res.status(400).json({ message: "Please provide the course ID" });
        }
        const course = await Course.findOne({where:{courseId:courseId}});
        if(!course){
            return res.status(404).json({message:"Not Found Course"});
        }

        const getAll = await Assignment.find({where:{course :{courseId:courseId}},relations:['course' ,'assignmentsubmition']});
        if(!getAll){
            return res.status(404).json({message:"No Assignments"})
        }
        return res.status(200).json(getAll);
        
    } catch (error:any) {
        console.log("Error in getAllAssignmentsForCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getAssignment:RequestHandler = async (req , res):Promise<any> => {
    try {
        const assignmentId :any = req.params.assignmentId;
        if(!assignmentId){
            return res.status(400).json({ message: "Please provide the assignment ID" })
        }
        const assignment = await Assignment.findOne({where:{assignmentId:assignmentId},relations:['assignmentsubmition']});
        if(!assignment){
            return res.status(404).json({message:"Not Found Assignment"})
        }
        return res.status(200).json(assignment);
    } catch (error:any) {
        console.log("Error in getAssignment controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const submittingAssignment:RequestHandler = async (req , res):Promise<any> => {
    try {

        const user = (req as any).user;
        const UserID: any = user.userId;
    
        const userIsExist = await User.findOne({ where: { UserID: UserID } });
        if (!userIsExist) {
            return res.status(400).json({ message: "User not found" });
        }


        const assignmentId :any = req.params.assignmentId;
        if(!assignmentId){
            return res.status(400).json({ message: "Please provide the assignment ID" })
        }
        const assignment = await Assignment.findOne({where:{assignmentId:assignmentId}});
        if(!assignment){
            return res.status(404).json({message:"Not Found Assignment"})
        }
        const {answer}=req.body;
        if(!answer){
            return res.status(400).json({message:"Please fill the field answer"});
        }
        const submitAns = Assignmentsubmition.create({
            answer:answer,
            assignment:assignment,
            user:userIsExist,
        });
        await submitAns.save();

        return res.status(201).json(submitAns);

    } catch (error:any) {
        console.log("Error in submittingAssignment controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const addScourForAssignment:RequestHandler = async (req , res):Promise<any> => {
    try {
        const assignmentId :any = req.params.assignmentId;
        const submitId :any = req.params.submitId;
        if(!assignmentId || !submitId){
            return res.status(400).json({ message: "Please provide the ID" })
        }
        const assignment = await Assignment.findOne({where:{assignmentId:assignmentId}});
        if(!assignment){
            return res.status(404).json({message:"Not Found Assignment"})
        }

        const submit = await Assignmentsubmition.findOne({where:{assignmentSubmitionId:submitId}});
        if(!submit){
            return res.status(404).json({message:"No Submitting"})
        }

        const {status} =req.body;
        if(!status){
            return res.status(400).json({ message: "Please provide the status" })
        }
        if (!["pass", "fill"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        submit.status=status;

        await submit.save();

        return res.status(200).json({message:"The grade has been spotted."})

    } catch (error:any) {
        console.log("Error in addScourForAssignment controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const AllSubmissions:RequestHandler = async (req , res):Promise<any> => {
    try {
        const assignmentId :any = req.params.assignmentId;
        if(!assignmentId){
            return res.status(400).json({ message: "Please provide the assignment ID" })
        }
        const AllSubmissions = await Assignment.findOne({where:{assignmentId:assignmentId} , relations:['assignmentsubmition']});
        if(!AllSubmissions){
            return res.status(404).json({message:"Not Found Assignment"})
        }

        return res.status(200).json(AllSubmissions);
    } catch (error:any) {
        console.log("Error in AllSubmissions controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}