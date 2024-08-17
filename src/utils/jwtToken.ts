import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userPayload } from "../interfaces/commonInterfaces/tokenInterfaces";

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_PRIVATE_KEY as string;
const refreshTokenSecret = process.env.REFRESH_TOKEN_PRIVATE_KEY as string;

export const generateAccessToken = (user: userPayload) => {
  return jwt.sign(user, accessTokenSecret, { expiresIn: "7h" });
};

export const generateRefreshToken = (user: userPayload) => {
  return jwt.sign(user, refreshTokenSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): any => {
  try {
      return jwt.verify(token, accessTokenSecret);
  } catch (error) {
      console.error('Error verifying token:', error);
      return null
  }
};