import jwt from "jsonwebtoken";
import { JwtPayload } from '../types/jwt.types';

const ACCESS_KEY = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_KEY = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export function generateAccessToken(payload: object): string {
    console.log("payload", {payload});
    return jwt.sign(payload, ACCESS_KEY, {expiresIn: ACCESS_TOKEN_EXPIRY});
}

export function generateRefreshToken(payload: object): string {
    console.log("payload", {payload});
    return jwt.sign(payload, REFRESH_KEY, {expiresIn: REFRESH_TOKEN_EXPIRY});
}

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    if (!token) throw new Error('No token provided');
    const decoded = jwt.verify(token, ACCESS_KEY);
    return decoded as JwtPayload;
  } catch (error) {
    throw error;
  }
};

export const verifyRefreshToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    if (!token) reject(new Error('No refresh token provided'));
    
    jwt.verify(token, REFRESH_KEY, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded as JwtPayload);
    });
  });
}