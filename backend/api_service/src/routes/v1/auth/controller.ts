import { Request, Response } from "express";
import AuthService from "@/services/AuthService";
import { AuthenticatedRequest } from "@/middleware/auth";
import Repository from "@/data/repositories";

export const register = async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName } = req.body;

  const result = await AuthService.register({
    username,
    email,
    password,
    firstName,
    lastName,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: result.user,
    tokens: result.tokens,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  res.json({
    message: "Login successful",
    user: result.user,
    tokens: result.tokens,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await AuthService.refreshTokens(refreshToken);

  res.json({
    message: "Token refreshed successfully",
    tokens,
  });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const user = await Repository.user.findByIdWithoutPassword(req.user.userId);

  res.json({
    user,
  });
};
