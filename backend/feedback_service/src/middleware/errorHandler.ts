import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`Error: ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: "error",
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// Custom error class
export class CustomError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
