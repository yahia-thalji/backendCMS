import express from 'express'
import { getAllCourses } from '../controller/courseController';

const router =express.Router();

router.post("/create");
router.post("/update/:courseId");
router.delete("/delete/:courseId");

// get course by id
router.get("/:courseId");
//get all courses
router.get("/getAllCourses",getAllCourses);
// enrollment
router.post("/subscribeCourse/:courseId");
// للموافقة رفض الاشتراك
router.post("/acceptOrRejected/:enrollmentId")

router.get("/getEnrollment/:enrollmentId");
//for Admin and for user if is accept and is't without expire date
router.get("/getAllEnrollment");

//Record
router.post("/addRecord/:courseId");
router.post("/updateRecord/:courseId");
router.delete("/addAndDeleteAndUpdateRecord/:courseId");

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