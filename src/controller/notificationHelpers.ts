import { Notification } from "../entities/notification";
import { User } from "../entities/user";


// Helper function to create notifications
export async function createNotification(
  messageTitle: string,
  type: string,
  fromUser: User,
  toUser: User
): Promise<Notification> {
  const notification = Notification.create({
    messageTitle,
    type,
    from: fromUser,
    to: toUser
  });
  
  return await notification.save();
}

// Get admin users (for sending admin notifications)
export async function getAdminUsers(): Promise<User[]> {
  return await User.createQueryBuilder("user")
    .leftJoinAndSelect("user.Role", "role")
    .where("role.roleName = :roleName", { roleName: "admin" })
    .getMany();
}