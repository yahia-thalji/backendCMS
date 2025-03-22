import { Request, Response, NextFunction } from 'express'
import { isUUID } from 'validator';

const notFound = (req: Request, res: Response, next: NextFunction) => {
    console.log(`Not found middleware triggered for URL: ${req.originalUrl}`);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`Error middleware triggered for URL: ${req.originalUrl}`);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: err.message });
};


const validateUUIDParam = (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id && !isUUID(req.params.id)) {
        return res.status(400).json({ message: "Invalid UUID format" });
    }
    next();
};


export { notFound, errorHandler, validateUUIDParam };
