import { Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/status.contants';
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.util';
import { AuthRequest, JwtPayload } from '../types/jwt.types';

export const verifyJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1];
        const refreshToken = req.headers['x-refresh-token'] as string;

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        if (!accessToken || !refreshToken) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Access token or refresh token not provided'
            });
            return;
        }

        try {
            const decodedAccess = verifyAccessToken(accessToken);
            req.user = decodedAccess as JwtPayload;
            next();
            return;
        } catch (accessError) {
            // Access token expired, verify refresh token
            const decodedRefresh = await verifyRefreshToken(refreshToken) as JwtPayload;

            if (!decodedRefresh) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid or expired refresh token'
                });
                return;
            }

            const newAccessToken = generateAccessToken({
                id: decodedRefresh.id,
                email: decodedRefresh.email,
                role: decodedRefresh.role
            });

            res.setHeader('Authorization', `Bearer ${newAccessToken}`);
            req.user = decodedRefresh;
            next();
        }
    } catch (error) {
        console.error('JWT Middleware Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'JWT middleware error'
        });
    }
};