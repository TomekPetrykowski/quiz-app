import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import Repository from "@/data/repositories";

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const user = await Repository.user.findByIdWithoutPassword(req.user.userId);

  res.json(user);
};
