import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { BadRequestError } from "@/errors/BadRequestError";
import { AuthenticatedRequest } from "@/middleware/auth";
import AuthenticationError from "@/errors/AuthenticationError";

export const getLeaderboards = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = pagination.calculateSkip(page, limit);
  const type = req.query.type as any;
  const period = req.query.period as string;
  const categoryId = req.query.categoryId as string;
  const isActive =
    req.query.isActive === "true"
      ? true
      : req.query.isActive === "false"
        ? false
        : undefined;

  const queryParams = {
    limit,
    offset,
    type,
    period,
    categoryId,
    isActive,
  };

  const [leaderboards, total] =
    await Repository.leaderboard.findAll(queryParams);

  const response = pagination.buildPaginationResponse(
    leaderboards,
    total,
    page,
    limit,
  );

  res.status(200).json(response);
};

export const getLeaderboardById = async (req: Request, res: Response) => {
  const leaderboard = await Repository.leaderboard.findById(req.params.id);
  res.status(200).json(leaderboard);
};

export const getLeaderboardEntries = async (req: Request, res: Response) => {
  const leaderboardId = req.params.id;
  const limit = parseInt(req.query.limit as string) || 100;

  const entries = await Repository.leaderboard.getLeaderboardEntries(
    leaderboardId,
    limit,
  );
  res.status(200).json(entries);
};

export const getUserPosition = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const userId = req.params.userId || req.user.userId;

  // Allow users to check their own position or admins to check anyone's
  if (userId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only check your own leaderboard position",
      statusCode: 403,
    });
  }

  const type = (req.query.type as any) || "GLOBAL";
  const categoryId = req.query.categoryId as string;

  const position = await Repository.leaderboard.getLeaderboardForUser(
    userId,
    type,
    categoryId,
  );

  if (!position) {
    res.status(200).json({ message: "User not found on this leaderboard" });
    return;
  }

  res.status(200).json(position);
};

export const createLeaderboard = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const leaderboard = await Repository.leaderboard.create(req.body);
  res.status(201).json(leaderboard);
};

export const updateLeaderboard = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const leaderboard = await Repository.leaderboard.update(
    req.params.id,
    req.body,
  );
  res.status(200).json(leaderboard);
};

export const deleteLeaderboard = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const leaderboard = await Repository.leaderboard.delete(req.params.id);
  res.status(200).json({
    message: "Leaderboard deleted successfully",
    leaderboard,
  });
};

export const updateLeaderboardRankings = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const leaderboardId = req.params.id;

  await Repository.leaderboard.updateLeaderboard(leaderboardId);

  res.status(200).json({
    message: "Leaderboard rankings updated successfully",
  });
};

export const initializeSystemLeaderboards = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const leaderboards =
    await Repository.leaderboard.initializeSystemLeaderboards();

  res.status(200).json({
    message: `${leaderboards.length} leaderboards initialized`,
    leaderboards,
  });
};
