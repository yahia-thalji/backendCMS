import { Request, Response, NextFunction } from 'express'
import { isUUID } from 'validator';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    console.log(`Not found middleware triggered for URL: ${req.originalUrl}`);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`Error middleware triggered for URL: ${req.originalUrl}`);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: err.message });
};


export const validateUUIDParam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.id && !isUUID(req.params.id)) {
         res.status(400).json({ message: "Invalid UUID format" });
    }
    next();
};


