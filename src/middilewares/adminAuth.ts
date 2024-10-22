import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/middilewareConfig";
import { adminPayload } from "../interfaces/commonInterfaces/tokenInterfaces";
import Mentee from "../models/menteeModel";

const adminAuthMiddleware = async(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	const token = req.header("Authorization")?.split(" ")[1];
	

	if (!token) {
		return res.status(401).json({ message: "Unauthorized, token is missing" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as adminPayload;
		const admin = await Mentee.findById(decoded.id);
		if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

		if (!admin.isAdmin) {
            return res.status(404).json({ message: 'admin not found' });
        }
		
		(req as any).admin = decoded;

		next();
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			return res
				.status(401)
				.json({ message: "Unauthorized, token has expired" });
		}

		return res.status(401).json({ message: "Unauthorized, invalid token" });
	}
};

export default adminAuthMiddleware;
