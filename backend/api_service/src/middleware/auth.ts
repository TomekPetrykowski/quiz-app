import { Request, Response, NextFunction } from "express";
import AuthService from "@/services/AuthService";
import AuthenticationError from "@/errors/AuthenticationError";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AuthenticationError({
      message: "Access token required",
      statusCode: 401,
      code: "ERR_AUTH",
    });
  }

  try {
    const payload = AuthService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new AuthenticationError({
      message: "Invalid or expired token",
      statusCode: 401,
      code: "ERR_AUTH",
    });
  }
};
