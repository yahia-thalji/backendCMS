import express from 'express';

const router = express.Router();

// get all notifications
router.get("/all");
// get a notification by user id
router.get("/user/:userId");
// make read = true when user read the notification
router.post("/:notificationId/read");

export default router;