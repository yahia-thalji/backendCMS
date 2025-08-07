import express from 'express';
import { courseReview, deleteReview, getAllReviewsForCourse, getAllReviewsForProduct, getReviewsForCourse, productReview, updateReview } from '../controller/reviewController';
import { IsAuthenticated } from '../middleware/protectRoute';

const router = express.Router();
router.post('/productReview',IsAuthenticated,productReview);
router.get('/getAllReviewsForProduct',getAllReviewsForProduct);

router.post('/courseReview',IsAuthenticated,courseReview);
router.get('/getAllReviewsForCourse',getAllReviewsForCourse);

//update
router.post('/updateReview/:reviewID',updateReview );

//delete
router.delete('/deleteReview/:reviewId' ,IsAuthenticated,deleteReview );

router.get("/getReviewsForCourse/:courseId",getReviewsForCourse)

export default router;