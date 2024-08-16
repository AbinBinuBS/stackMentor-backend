import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtToken';
import AdminModel from '../models/menteeModel';  


export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        res.status(401).json({ message: '401' });
        return;
    }

    const admin = verifyToken(token);
    
    if (admin == null) {
        res.status(401).json({ message: '401' });
        return;
    }

    const adminData = await AdminModel.findOne({ email: admin.email });

    if (!adminData) {
        res.status(403).json({ message: '403' });
        return;
    } else if (adminData?.isActive === false) {  
        res.status(401).json({ message: 'Your account has been blocked by admin!' });
        return;
    }

    (req as any).admin = admin;
    next();
};
