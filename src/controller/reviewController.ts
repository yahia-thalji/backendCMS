import { RequestHandler } from "express";
import { Reviews } from "../entities/reviews";
import { User } from "../entities/user";
import { Product } from "../entities/product";
import { Course } from "../entities/course";

export const productReview: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { rating, comment, productId } = req.body;
        const user = (req as any).user;
        const UserID = user?.userId;

        if (!user || !UserID) {
            return res.status(400).json({ message: "User not found" });
        }

        const userIsExist = await User.findOne({ where: { UserID: UserID } });
        if (!userIsExist) {
            return res.status(400).json({ message: "User not found" });
        }

        if (isNaN(rating)) {
            return res.status(400).json({ message: "Invalid Rating. It must be a number." });
        }

        const product = await Product.findOne({ where: { productId: Number(productId) } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        //Check if the review already exists
        let review = await Reviews.findOne({
            where: {
                user: { UserID: UserID },
                product: { productId: Number(productId) }
            },
            relations: ["user", "product"]
        });

        if (review) {
            // Update review
            review.rating = Number(rating);
            review.comment = comment;
            await review.save();
            return res.status(200).json({ message: "Review updated successfully", review });
        } else {
            // Create new review
            review = Reviews.create({
                rating: Number(rating),
                comment: comment,
                product: [product], 
                user: userIsExist
            });

            await review.save();
            return res.status(201).json({ message: "Review created successfully", review });
        }

    } catch (error: any) {
        console.error("Error in productReview controller", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getAllReviewsForProduct: RequestHandler = async (req, res):Promise<any> => {
    try {
      const allReviews = await Reviews.find({
        relations: ["product", "user"],
      });
  
      const productReviews = allReviews.filter((review) => review.product && review.product.length > 0);
  
      if (productReviews.length === 0) {
        return res.status(404).json({ message: "لا توجد مراجعات على المنتجات." });
      }
  
      return res.status(200).json({ reviews: productReviews });
    } catch (error: any) {
      console.error("خطأ في getAllReviewsForProduct:", error.message);
      return res.status(500).json({ error: "حدث خطأ أثناء جلب المراجعات." });
    }
  };


export const courseReview:RequestHandler = async (req , res):Promise<any> => {
    try {
        const { rating, comment, courseId } = req.body;
        const user = (req as any).user;
        const UserID = user?.userId;

        if (!user || !UserID) {
            return res.status(400).json({ message: "User not found" });
        }

        const userIsExist = await User.findOne({ where: { UserID: UserID } });
        if (!userIsExist) {
            return res.status(400).json({ message: "User not found" });
        }

        if (isNaN(rating)) {
            return res.status(400).json({ message: "Invalid Rating. It must be a number." });
        }

        const course = await Course.findOne({ where: { courseId: Number(courseId) } });
        if (!course) {
            return res.status(404).json({ message: "course not found" });
        }

        // Check if the review already exists
        let review = await Reviews.findOne({
            where: {
                user: { UserID: UserID },
                course: { courseId: Number(courseId) }
            },
            relations: ["user", "course"]
        });

        if (review) {
            // Update review
            review.rating = Number(rating);
            review.comment = comment;
            await review.save();
            return res.status(200).json({ message: "Review updated successfully", review });
        } else {
            // Create new review
            review = Reviews.create({
                rating: Number(rating),
                comment: comment,
                course: [course], 
                user: userIsExist
            });

            await review.save();
            return res.status(201).json({ message: "Review created successfully", review });
        }

    }  catch (error:any) {
        console.log("Error in courseReview controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getAllReviewsForCourse:RequestHandler = async (req , res):Promise<any> => {
    try {
        const allReviews = await Reviews.find({
            relations: ["course", "user"],
          });
      
          const courseReviews = allReviews.filter((review) => review.course && review.course.length > 0);
      
          if (courseReviews.length === 0) {
            return res.status(404).json({ message: "لا توجد مراجعات على الكورسات." });
          }
      
          return res.status(200).json({ reviews: courseReviews });
    } catch (error:any) {
        console.log("Error in getAllReviewsForCourse controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const updateReview:RequestHandler = async (req , res):Promise<any> => {
    try {
        // const reviewId :any = req.params.reviewID;
        // const { rating, comment } = req.body;
        // const reviewToUpdate = await Reviews.findOne({ where: { reviewID: reviewId } });
        // if (!reviewToUpdate) {
        //     return res.status(404).send({ message: "Review not found" });
        // }
        // reviewToUpdate.rating = rating || reviewToUpdate.rating;
        // reviewToUpdate.comment = comment || reviewToUpdate.comment;

        // const updatedReview = await reviewToUpdate.save();
        // return updatedReview;
    } catch (error:any) {
        console.log("Error in updateReview controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deleteReview: RequestHandler = async (req, res): Promise<any> => {
    try {
        const reviewId:any = req.params.reviewId; // أو req.body.reviewId حسب الطريقة
        const user = (req as any).user;
        const userId = user?.userId;

        if (isNaN(reviewId)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const review = await Reviews.findOne({
            where: { reviewID: reviewId },
            relations: ["user"]
        });

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // 🔐 تأكد إن المستخدم هو صاحب المراجعة
        if (review.user.UserID !== userId) {
            return res.status(403).json({ message: "You are not allowed to delete this review" });
        }

        await Reviews.remove(review);

        return res.status(200).json({ message: "Review deleted successfully" });

    } catch (error: any) {
        console.log("Error in deleteReview controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getReviewsForCourse: RequestHandler = async (req, res): Promise<any> => {
    try {
        
        const courseId: any = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({ message: "must provide course id" });
        }

        const reviewCourse = await Reviews.find({
            where: { course: { courseId: courseId } },
            relations: ['course', 'user', 'user.UserProfilePicture']
        });

        if (!reviewCourse || reviewCourse.length === 0) {
            return res.status(404).json({ message: "No Reviews Yet" });
        }

        const filteredReviews = reviewCourse.map(review => ({
            reviewID: review.reviewID,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            UserID: review.user?.UserID,
            firstName: review.user?.firstName,
            lastName: review.user?.lastName,
            profileImage: review.user?.UserProfilePicture?.filePath || null
        }));

        return res.status(200).json(filteredReviews);
    } catch (error: any) {
        console.log("Error in getReviewsForCourse controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

