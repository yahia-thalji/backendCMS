import { RequestHandler } from "express";
import { User } from "../entities/user";

export const getUserProfile :RequestHandler = async (req , res): Promise<any> => {
    const userId: any = req.params.id;
    try {
        const user = await User.findOne({where:{UserID:userId}});
        if(!user){
            return res.status(400).json({message : "User Not Found."});
        }
        return res.status(200).json(user);
    } catch (error:any) {
        console.log("Error in getUserProfile controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const updateUser: RequestHandler = async (req, res): Promise<any> => {
    try {
        const userId = (req as any).user.payload.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({ where: { UserID: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { firstName, lastName, email, phoneNumber, address, gender, dateOfBirth, profilePicture } = req.body;

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            user.email = email;
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;
        if (gender) user.gender = gender;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        
        if (profilePicture) {
            user.UserProfilePicture = profilePicture; 
        }

        await user.save();

        return res.status(200).json({ message: "User updated successfully", user });

    } catch (error: any) {
        console.error("Error in updateUser controller:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};