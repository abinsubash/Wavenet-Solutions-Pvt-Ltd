import { ZodError,ZodSchema } from "zod";
import { Request,Response,NextFunction } from "express";
import { HttpStatus } from "../constants/status.contants";
import formatZodErrors from "../utils/format-zod-error.util";
const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            console.log(error)
            res.status(HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: formatZodErrors(error),
            });
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
};


export default validate