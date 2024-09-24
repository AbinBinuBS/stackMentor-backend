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
            try {
                const refreshToken = req.header('refresh-token');
                if (!refreshToken) {
                    return res.status(401).json({ message: 'Unauthorized, refresh token is missing' });
                }

                const decodedRefreshToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as mentorPayload;
                const mentee = await Mentee.findById(decodedRefreshToken.id);

                if (!mentee) {
                    return res.status(404).json({ message: 'Mentee not found' });
                }

                if (!mentee.isActive) {
                    return res.status(403).json({ code: 'ACCOUNT_INACTIVE', message: 'Forbidden, account is not active' });
                }


                const newAccessToken = jwt.sign({
                    id: decodedRefreshToken.id,
                    name: decodedRefreshToken.name,
                    email: decodedRefreshToken.email,
                    isActive: decodedRefreshToken.isActive
                }, JWT_SECRET, { expiresIn: '15m' });

                const newRefreshToken = jwt.sign({
                    id: decodedRefreshToken.id,
                    name: decodedRefreshToken.name,
                    email: decodedRefreshToken.email
                }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                res.setHeader('refresh-token', newRefreshToken);

                (req as any).mentee = jwt.verify(newAccessToken, JWT_SECRET) as mentorPayload;
                next();
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                return res.status(401).json({ message: 'Unauthorized, refresh token invalid or expired' });
            }
        } else {
            console.error('Error verifying token:', err);
            return res.status(401).json({ message: 'Unauthorized, invalid or expired token' });
        }
    }
};

export default menteeAuthMiddleware;
