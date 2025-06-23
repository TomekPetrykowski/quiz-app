import { Request, Response, NextFunction } from "express";
import { keycloak } from "@/config";
import AuthenticationError from "@/errors/AuthenticationError";
import Repository from "@/data/repositories";

export interface AuthenticatedRequest extends Request {
  kauth?: {
    grant?: {
      access_token?: {
        content?: {
          sub: string;
          email: string;
          preferred_username?: string;
          given_name?: string;
          family_name?: string;
          realm_access?: {
            roles: string[];
          };
          azp?: string;
          aud?: string;
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

export const protectEndpoint = (role?: string) => [
  keycloak.protect(role),

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

      const keycloakId = tokenContent.sub;
      let user = await Repository.user.findByKeycloakId(keycloakId);

      if (!user) {
        user = await Repository.user.create({
          keycloakId,
          email: tokenContent.email,
          username: tokenContent.preferred_username || tokenContent.email,
          firstName: tokenContent.given_name,
          lastName: tokenContent.family_name,
        });
      }

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
