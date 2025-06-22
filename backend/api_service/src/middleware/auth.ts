import { Request, Response, NextFunction } from "express";
import { keycloak } from "@/config";
import AuthenticationError from "@/errors/AuthenticationError";
import Repository from "@/data/repositories";

export interface AuthenticatedRequest extends Request {
  kauth?: {
    grant?: {
      access_token?: {
        content?: {
          sub: string; // Keycloak user ID
          email: string;
          preferred_username?: string;
          given_name?: string;
          family_name?: string;
          realm_access?: {
            roles: string[];
          };
          azp?: string; // Authorized party (client ID)
          aud?: string; // Audience
        };
      };
    };
  };
  user?: {
    userId: string;
    email: string;
    username: string;
    roles: string[];
  };
}

// This middleware extracts user info from Keycloak token and adds it to req.user
export const extractUserInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log(req);

  try {
    // The request should already be authenticated by keycloak.protect()
    const tokenContent = req.kauth?.grant?.access_token?.content;

    if (!tokenContent) {
      return next(); // Continue without user info
    }

    // Find or create user in our database based on Keycloak ID
    const keycloakId = tokenContent.sub;
    let user = await Repository.user.findByKeycloakId(keycloakId);

    if (!user) {
      // Create user record if it doesn't exist
      user = await Repository.user.create({
        keycloakId,
        email: tokenContent.email,
        username: tokenContent.preferred_username || tokenContent.email,
        firstName: tokenContent.given_name,
        lastName: tokenContent.family_name,
      });
    }

    // Add user info to the request
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: tokenContent.realm_access?.roles || [],
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Role-based authorization middleware
export const requireRoles = (roles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AuthenticationError({
          message: "User not authenticated",
          statusCode: 401,
        });
      }

      const userRoles = req.user.roles;
      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        throw new AuthenticationError({
          message: "Insufficient permissions",
          statusCode: 403,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Import statements remain the same

// This middleware chain combines Keycloak protection with user extraction
export const protectEndpoint = (role?: string) => [
  // First apply Keycloak protection
  keycloak.protect(role),

  // Then extract and map the user from Keycloak to your database
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tokenContent = req.kauth?.grant?.access_token?.content;

      if (!tokenContent) {
        return next(
          new AuthenticationError({
            message: "Invalid token content",
            statusCode: 401,
          }),
        );
      }

      // Find or create user based on Keycloak ID
      const keycloakId = tokenContent.sub;
      let user = await Repository.user.findByKeycloakId(keycloakId);

      if (!user) {
        // Create user if it doesn't exist
        user = await Repository.user.create({
          keycloakId,
          email: tokenContent.email,
          username: tokenContent.preferred_username || tokenContent.email,
          firstName: tokenContent.given_name,
          lastName: tokenContent.family_name,
        });
      }

      // Attach user to request
      req.user = {
        userId: user.id,
        email: user.email,
        username: user.username,
        roles: tokenContent.realm_access?.roles || [],
      };

      next();
    } catch (error) {
      next(error);
    }
  },
];

// For debugging only - in production you may want to disable this
export const debugKeycloakProtect = (role?: string) => {
  // Your existing debug code...
};

// Replace authenticateToken with this function to maintain API compatibility
export const authenticateToken = [keycloak.protect(), extractUserInfo];
