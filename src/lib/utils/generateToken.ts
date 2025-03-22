import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { User } from '../../entities/user';

const generateToken = async (userid: string) => {
    const user = await User.findOne({
        where: { UserID: userid },
        relations: ['Role'],  
    });
    
    if (!user) {
        throw new Error('User not found');
    }

    return jwt.sign(
        {
            userId: user.UserID,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.Role.roleName,
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '12h' }
    );

    
};

const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};

export { generateToken, verifyToken };
