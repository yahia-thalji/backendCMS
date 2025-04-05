import express from 'express'
import { acceptOrRejected, AddAssignment, addRecords, addScourForAssignment, AllSubmissions, createCourse, deleteAssignment, deleteCourse, deleteRecord, editAssignment, getAll, getAllAssignmentsForCourse, getAssignment, getCourse, getEnrollments, getMyEnrollment, getRecords, submittingAssignment, subscribeToCourse, updateCourse, updateRecord } from '../controller/courseController';
import { IsAuthenticated, isAuthorized } from '../middleware/protectRoute';
import { uploadFields } from '../middleware/multerMiddleware';

const router =express.Router();
//get all courses
router.get("/getMyEnrollment",IsAuthenticated,getMyEnrollment);
router.get("/getAllCourses",getAll);
router.get("/getAllEnrollment",getEnrollments);

router.post("/create",uploadFields,createCourse);
router.post("/update/:courseId",updateCourse);
router.delete("/delete/:courseId",deleteCourse);

// get course by id
router.get("/:courseId",getCourse);
// enrollment
router.post("/subscribeToCourse/:courseId",IsAuthenticated,subscribeToCourse);
// للموافقة رفض الاشتراك
router.post("/acceptOrRejected",IsAuthenticated,acceptOrRejected)

//for Admin and for user if is accept and is't without expire date

router.delete("/deleteRecord/:resourceId",deleteRecord);
//Record
router.post("/addRecord/:courseId",uploadFields,addRecords);
router.get("/getRecords/:courseId",getRecords)
router.post("/updateRecord/:resourceId",uploadFields,updateRecord);

// assignments 
router.post("/:courseId/AddAssignment",AddAssignment);
router.post("/updateAssignment/:assignmentId",editAssignment);
router.delete("/deleteAssignment/:assignmentId",deleteAssignment);

router.get("/getAllAssignments/:courseId",getAllAssignmentsForCourse);
router.get("/getAssignment/:assignmentId" ,getAssignment);


//submit 
router.post("/assignment/:assignmentId/submit",submittingAssignment);
//update submit for added scour by admin
router.post("/assignment/addGrade/:assignmentId/:submitId",addScourForAssignment);
//for admin
router.get('/:assignmentId/AllSubmissions',AllSubmissions);


// get ass with submit
export default router;