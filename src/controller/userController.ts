import { RequestHandler } from "express";
import { User } from "../entities/user";
import { Resources } from "../entities/resources";
import bcrypt from "bcrypt"; 

export const getUserProfile :RequestHandler = async (req , res): Promise<any> => {
    const userId: any = req.params.id;
    try {
        const user = await User.findOne({where:{UserID:userId},relations:['UserProfilePicture']});
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
        const userId: any = req.params.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({ where: { UserID: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { firstName, lastName, email, phoneNumber, address, gender, dateOfBirth, password, confirmPassword } = req.body;
        console.log("password" , password);
        console.log("confirmPassword" , confirmPassword);
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

        if (password || confirmPassword) {
            // التحقق من وجود كل الحقول المطلوبة
            if (!password || !confirmPassword) {
                return res.status(400).json({ 
                    message: "Both password and confirm password are required" 
                });
            }

            // التحقق من تطابق كلمتي المرور
            if (password !== confirmPassword) {
                return res.status(400).json({ 
                    message: "Password and confirm password do not match" 
                });
            }

            // التحقق من قوة كلمة المرور
            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters long"
                });
            }

            if (!/[A-Z]/.test(password)) {
                return res.status(400).json({
                    message: "Password must contain at least one uppercase letter"
                });
            }

            if (!/[0-9]/.test(password)) {
                return res.status(400).json({
                    message: "Password must contain at least one number"
                });
            }

            // تشفير كلمة المرور وحفظها
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }


        if (req.file) {
            let resource = await Resources.findOne({ where: { user: { UserID: user.UserID } } });

            if (resource) {
                resource.filePath = req.file.path;
                resource.fileType = req.file.mimetype;
                resource.entityName = req.file.filename;
                await resource.save();
            } else {
                resource = new Resources();
                resource.filePath = req.file.path;
                resource.fileType = req.file.mimetype;
                resource.entityName = req.file.filename;
                resource.user = user;
                await resource.save();
            }

            user.UserProfilePicture = resource;
        }

        await user.save();

        const updatedUser = await User.findOne({
            where: { UserID: userId },
            relations: ['UserProfilePicture']
        });

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error: any) {
        console.error("Error in updateUser controller:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const getAllUsers:RequestHandler = async (req , res):Promise<any> => {
    try {
           return res.json({ message: "hello" });
    } catch (error:any) {
        console.log("Error in getAllUsers controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
// export const getAllUsers:RequestHandler = async (req , res):Promise<any> => {
//     try {
//         const users = await User.find({
//             order:{
//                 firstName:"ASC"
//             }
//         });
//         if(!users){
//             return res.status(400).json({message:"Not Found"})
//         }
//         return res.status(200).json(users)
//     } catch (error:any) {
//         console.log("Error in getAllUsers controller", error.message);
//         res.status(500).json({error: "Internal server error"});
//     }
// }