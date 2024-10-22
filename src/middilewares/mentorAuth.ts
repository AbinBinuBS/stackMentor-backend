import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from '../config/middilewareConfig';
import { mentorPayload } from '../interfaces/commonInterfaces/tokenInterfaces';
import Mentor from '../models/mentorModel';

const mentorAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token is missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as mentorPayload;
        const mentor = await Mentor.findById(decoded.id);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        if (!mentor.isActive) {
            return res.status(403).json({ code: 'ACCOUNT_INACTIVE', message: 'Forbidden, account is not active' });
        }

        if (mentor.isVerified === 'beginner' || mentor.isVerified === 'applied' || mentor.isVerified === 'rejected') {
            return res.status(403).json({ code: 'NOT_VERIFIED', message: 'Verification required. Please complete the verification process.' });
        }

        (req as any).mentor = decoded;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Unauthorized, invalid or expired token' });
        }
        return res.status(401).json({ message: 'Unauthorized, invalid token' });
    }
};


export default mentorAuthMiddleware;
