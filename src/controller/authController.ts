import { RequestHandler } from "express";
import { User } from "../entities/user";
import bcrypt from "bcrypt"
import { Role } from "../entities/role";


export const signup: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { firstName, lastName, email, phoneNumber, address, gender, dateOfBirth, password ,confirmPassword } = req.body;
        if(!firstName || !lastName || !email || !phoneNumber || !address || !gender || !dateOfBirth || !password){
            return res.status(400).json({ message: "Please Fill All Field" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ ;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Invalid Email Format"})
        }
        const existingEmail = await User.findOne({where:{email:email}});
        if(existingEmail){
            return res.status(400).json({error:'This Email Is Already'})
        }
        const existingphoneNumber = await User.findOne({where:{phoneNumber:phoneNumber}});
        if(existingphoneNumber){
            return res.status(400).json({error:"This Phone Number Is Already Exist"});
        }
        if(password !== confirmPassword){
            return res.status(400).json({error:'The Password Is Not Matched'});
        }else if(password.length < 6){
            return res.status(400).json({error:"password must be at least 6 characters long."});
        }
        
        if(phoneNumber.length <9 || phoneNumber.length >12){
            return res.status(400).json({error:"Phone Number must be at least 9 Numbers And At Most 12 Numbers."});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let role = await Role.findOne({where: {roleName:'user'}});
        if(!role){
            role = Role.create({roleName:'user'});
            role = await role.save();
        }
        const dob= new Date(dateOfBirth);
        const createUser = User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            gender,
            dateOfBirth :dob,
            password : hashedPassword,
            Role:role,
        });
        await createUser.save();
        

        //notification to send welcome for new user

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login :RequestHandler = async (req , res ) :Promise<any> => {
    try {
        const {email , password } = req.body;
        if(!email || !password){
            return res.status(400).json({error:"Please provide an email and password"});
        }
        const user = await User.findOneBy({email:email});
        if(!user){
            return res.status(400).json({error:"Please provide an email and password"});
        }
        const passwordMatch = await bcrypt.compare(password, user!.password);
        if(!passwordMatch){
            return res.status(400).json({error:"Please provide an email and password"});
        }

        return res.status(201).json({meesage:"welcome in C.P system"});
    } catch (error:any) {
        console.log("Error in login controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


// export const logout = async (req:Request , res : Response) => {
//     try {
        
//     } catch (error:any) {
//         console.log("Error in logout controller", error.message);
//         res.status(500).json({error: "Internal server error"});
//     }
// }

