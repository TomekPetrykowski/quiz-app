import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { CustomError } from "./errorHandler";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: { [key: string]: string }[] = [];
    errors.array().map((err) => extractedErrors.push({ [err.type]: err.msg }));

    throw new CustomError("Validation error", 400, extractedErrors);
  };
};
