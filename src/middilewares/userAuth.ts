import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtToken';
import MenteeModel from '../models/menteeModel';  



export const menteeAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        res.status(401).json({ message: 'UNAUTHORIZED' });
        return;
    }

    const mentee = verifyToken(token);
    
    if (mentee == null) {
        res.status(401).json({ message: 'UNAUTHORIZED' });
        return;
    }

    const menteeData = await MenteeModel.findOne({ email: mentee.email });

    if (!menteeData) {
        res.status(403).json({ message: 'FORBIDDEN' });
        return;
    } else if (menteeData?.isActive === true) {
        res.status(401).json({ message: 'Your account has been blocked by admin!' });
        return;
    }

    (req as any).mentee = mentee;  
    next();
};
