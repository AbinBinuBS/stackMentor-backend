import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from '../config/middilewareConfig';
import { mentorPayload } from '../interfaces/commonInterfaces/tokenInterfaces';
import Mentee from '../models/menteeModel';

const menteeAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token is missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as mentorPayload;
        const mentee = await Mentee.findById(decoded.id);

        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }

        if (!mentee.isActive) {
            return res.status(403).json({ code: 'ACCOUNT_INACTIVE', message: 'Forbidden, account is not active' });
        }


        (req as any).mentee = decoded;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Unauthorized, refresh token invalid or expired' });
        } 
        return res.status(401).json({ message: 'Unauthorized, invalid or expired token' });
    }
};

export default menteeAuthMiddleware;
