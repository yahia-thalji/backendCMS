import { RequestHandler } from "express";
import { Notification } from "../entities/notification";
import { User } from "../entities/user";

// Get all notifications for current user

export const getUserNotifications: RequestHandler = async (req, res):Promise<any>  => {
  try {
    const user = (req as any).user;
    const notifications = await Notification.find({
      where: { to: { UserID: user.userId } },
      order: { createdAt: 'desc' }
    });
    res.status(200).json(notifications);
  } catch (error: any) {
    console.error("Error in getUserNotifications", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark notification as read
export const markNotificationAsRead: RequestHandler = async (req, res):Promise<any>  => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneBy({ notificationId: Number(notificationId) });
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    notification.read = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error: any) {
    console.error("Error in markNotificationAsRead", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send notification (admin only)
export const sendNotification: RequestHandler = async (req, res):Promise<any>  => {
  try {
    const { messageTitle, type, toUserId } = req.body;
    const fromUser = (req as any).user;
    
    const toUser = await User.findOneBy({ UserID: toUserId });
    if (!toUser) {
      return res.status(404).json({ error: "Recipient user not found" });
    }
    
    const notification = Notification.create({
      messageTitle,
      type,
      from: fromUser,
      to: toUser
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (error: any) {
    console.error("Error in sendNotification", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};