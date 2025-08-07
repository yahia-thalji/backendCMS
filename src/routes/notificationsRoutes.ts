import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  sendNotification
} from '../controller/notificationsController';
import { IsAuthenticated } from '../middleware/protectRoute';

const router = express.Router();

// Get user notifications
router.get('/', IsAuthenticated,getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', IsAuthenticated, markNotificationAsRead);

// Send notification (admin only)
router.post('/', IsAuthenticated, sendNotification);

export default router;