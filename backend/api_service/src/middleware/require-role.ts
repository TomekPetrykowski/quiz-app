import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import AuthenticationError from "@/errors/AuthenticationError";

/**
 * Middleware to require a user to have at least one of the specified roles.
 * Usage: requireRole(["admin", "moderator"])
 */
export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    if (!roles.some((role) => userRoles.includes(role))) {
      return next(
        new AuthenticationError({
          message: "Insufficient permissions",
          statusCode: 403,
        }),
      );
    }
    next();
  };
}
