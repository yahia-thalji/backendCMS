import express from 'express'
import { acceptOrRejected, addRecord, createCourse, deleteCourse, getAll, getCourse, getEnrollments, getMyEnrollment, subscribeToCourse, updateCourse } from '../controller/courseController';
import { IsAuthenticated, isAuthorized } from '../middleware/protectRoute';
import { uploadFields } from '../middleware/multerMiddleware';

const router =express.Router();
//get all courses
router.get("/getAllCourses",getAll);
router.get("/getAllEnrollment",getEnrollments);
router.get("/getMyEnrollment",IsAuthenticated,getMyEnrollment);

router.post("/create",uploadFields,createCourse);
router.post("/update/:courseId",updateCourse);
router.delete("/delete/:courseId",deleteCourse);

// get course by id
router.get("/:courseId",getCourse);
// enrollment
router.post("/subscribeToCourse/:courseId",IsAuthenticated,subscribeToCourse);
// للموافقة رفض الاشتراك
router.post("/acceptOrRejected",isAuthorized,acceptOrRejected)

//for Admin and for user if is accept and is't without expire date

//Record
router.post("/addRecord/:courseId",uploadFields,addRecord);
router.post("/updateRecord/:courseId");
router.delete("/deleteRecord/:courseId");

// assignments
router.post("/:courseId/AddAssignment");
router.post("/update/:courseId/:assignmentId");
router.delete("/delete/:courseId/:assignmentId");

router.get("/getAllAssignments");
router.get("/:assignmentId");


//submit 
router.post("/:assignmentId/submit");
//update submit for added scour by admin
router.post("/:assignmentId/:submitId");
//for admin
router.get('/:courseId/:assignmentId/AllSubmissions');


// get ass with submit
export default router;