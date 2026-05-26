import type  { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction        
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            data: null,
        });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                success : false ,
                data: null,
                error: "Missing token"
            });
            return;
        }
    

        const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as {
            userId: string;
            email: string;
        };

        req.user = decoded;

        next();
    } catch (e) {
        return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN",
        data: null,
        });
    }
};