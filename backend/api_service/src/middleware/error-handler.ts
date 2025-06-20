import { NextFunction, Request, Response } from "express";
import config from "../config";
import { getErrorMessage } from "../utils";
import CustomError from "../errors/CustomError";
import Joi from "joi";
import AuthenticationError from "@/errors/AuthenticationError";

export default function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent || config.debug) {
    next(error);
    return;
  }

  if (Joi.isError(error)) {
    const validationError: ValidationError = {
      error: {
        message: "Validation error",
        code: "ERR_VALID",
        errors: error.details.map((detail) => ({
          message: detail.message,
        })),
      },
    };

    res.status(422).json(validationError);
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code || "ERR_AUTH",
      },
    });
    return;
  }

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message:
        getErrorMessage(error) ||
        "An error occurred. Please view logs for more details",
    },
  });
}
