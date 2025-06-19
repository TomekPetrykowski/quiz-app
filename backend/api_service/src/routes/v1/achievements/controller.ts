import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { BadRequestError } from "@/errors/BadRequestError";
import { AuthenticatedRequest } from "@/middleware/auth";
import AuthenticationError from "@/errors/AuthenticationError";

export const getAchievements = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = pagination.calculateSkip(page, limit);
  const search = req.query.search as string;
  const type = req.query.type as any;
  const isActive =
    req.query.isActive === "true"
      ? true
      : req.query.isActive === "false"
        ? false
        : undefined;

  const queryParams = {
    limit,
    offset,
    search,
    type,
    isActive,
  };

  const [achievements, total] =
    await Repository.achievement.findAll(queryParams);

  const response = pagination.buildPaginationResponse(
    achievements,
    total,
    page,
    limit,
  );

  res.status(200).json(response);
};

export const getAchievementById = async (req: Request, res: Response) => {
  const achievement = await Repository.achievement.findById(req.params.id);
  res.status(200).json(achievement);
};

export const getUserAchievements = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  // Allow users to see their own achievements or admins to see anyone's
  const userId = req.params.userId || req.user.userId;

  if (userId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only view your own achievements",
      statusCode: 403,
    });
  }

  const achievements =
    await Repository.achievement.findUserAchievements(userId);
  res.status(200).json(achievements);
};

export const createAchievement = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const achievement = await Repository.achievement.create(req.body);
  res.status(201).json(achievement);
};

export const updateAchievement = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const achievement = await Repository.achievement.update(
    req.params.id,
    req.body,
  );
  res.status(200).json(achievement);
};

export const deleteAchievement = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const achievement = await Repository.achievement.delete(req.params.id);
  res.status(200).json({
    message: "Achievement deleted successfully",
    achievement,
  });
};

export const awardAchievement = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const { userId, achievementId, progress } = req.body;

  const userAchievement = await Repository.achievement.awardAchievement(
    userId,
    achievementId,
    progress,
  );

  res.status(200).json(userAchievement);
};

export const checkUserAchievements = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  // Only allow checking own achievements
  const userId = req.params.userId || req.user.userId;

  if (userId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only check your own achievements",
      statusCode: 403,
    });
  }

  const newAchievements =
    await Repository.achievement.checkAndAwardAchievements(userId);
  res.status(200).json({
    message: `${newAchievements.length} new achievements awarded`,
    achievements: newAchievements,
  });
};
