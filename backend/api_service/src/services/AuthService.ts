import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "@/config";
import Repository from "@/data/repositories";
import { BadRequestError } from "@/errors/BadRequestError";
import AuthenticationError from "@/errors/AuthenticationError";

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = "15m";
  private readonly REFRESH_TOKEN_EXPIRY = "7d";

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new AuthenticationError({
        message: "Invalid or expired access token",
        statusCode: 401,
        code: "ERR_AUTH",
      });
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
    } catch (error) {
      throw new AuthenticationError({
        message: "Invalid or expired refresh token",
        statusCode: 401,
        code: "ERR_AUTH",
      });
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const existingUser = await Repository.user.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestError({
        message: "User with this email already exists",
      });
    }

    const existingUsername = await Repository.user.findByUsername(
      userData.username,
    );
    if (existingUsername) {
      throw new BadRequestError({
        message: "Username already exists",
      });
    }

    const hashedPassword = await this.hashPassword(userData.password);

    const user = await Repository.user.create({
      ...userData,
      password: hashedPassword,
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async login(emailOrUsername: string, password: string) {
    const user = await Repository.user.findByEmailOrUsername(emailOrUsername);
    if (!user) {
      throw new BadRequestError({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError({
        message: "Invalid credentials",
      });
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async refreshTokens(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await Repository.user.findById(payload.userId);
    if (!user) {
      throw new AuthenticationError({
        message: "User not found",
        statusCode: 401,
        code: "ERR_AUTH",
      });
    }

    return this.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

export default new AuthService();
