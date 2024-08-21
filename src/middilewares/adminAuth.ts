import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/middilewareConfig';
import { adminPayload } from '../interfaces/commonInterfaces/tokenInterfaces';

const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token is missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as adminPayload;

        (req as any).admin = decoded;

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Unauthorized, token has expired' });
        }

        return res.status(401).json({ message: 'Unauthorized, invalid token' });
    }
};

export default adminAuthMiddleware;
