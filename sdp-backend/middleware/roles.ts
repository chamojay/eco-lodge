import { NextFunction, Request, Response } from 'express';

export const roles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role; // Assuming req.user is populated by authentication middleware

        if (!userRole) {
            return res.status(403).json({ message: 'Access denied. No role provided.' });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        }

        next();
    };
};