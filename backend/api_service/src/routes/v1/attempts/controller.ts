import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { AuthenticatedRequest } from "@/middleware/auth";
import AuthenticationError from "@/errors/AuthenticationError";
import logger from "@/logger";
import { Logger } from "winston";

export const getQuizAttempts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = pagination.calculateSkip(page, limit);
  const userId = req.query.userId as string;
  const quizId = req.query.quizId as string;
  const status = req.query.status as any;

  const queryParams = {
    limit,
    offset,
    userId,
    quizId,
    status,
  };

  const [attempts, total] = await Repository.quizAttempt.findAll(queryParams);

  const response = pagination.buildPaginationResponse(
    attempts,
    total,
    page,
    limit,
  );

  res.status(200).json(response);
};

export const getQuizAttemptById = async (req: Request, res: Response) => {
  const attempt = await Repository.quizAttempt.findById(req.params.id);
  res.status(200).json(attempt);
};

export const getUserAttempts = async (
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

  if (userId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only view your own attempts",
      statusCode: 403,
    });
  }

  const quizId = req.query.quizId as string;

  const attempts = await Repository.quizAttempt.findUserAttempts(
    userId,
    quizId,
  );
  res.status(200).json(attempts);
};

export const startQuizAttempt = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const quizId = req.params.quizId;
  await Repository.quiz.findById(quizId);

  const attempt = await Repository.quizAttempt.startAttempt(
    req.user.userId,
    quizId,
  );
  res.status(201).json(attempt);
};

export const submitAnswer = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const attemptId = req.params.attemptId;

  const attempt = await Repository.quizAttempt.findById(attemptId);
  if (attempt.userId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only submit answers to your own attempts",
      statusCode: 403,
    });
  }

  const answer = await Repository.quizAttempt.submitAnswer({
    attemptId,
    questionId: req.body.questionId,
    answerId: req.body.answerId,
    answerIds: req.body.answerIds,
    textAnswer: req.body.textAnswer,
    timeSpent: req.body.timeSpent,
  });

  res.status(200).json(answer);
};

const quizAttemptGeneral = async (
  req: AuthenticatedRequest,
  res: Response,
  action: (attemptId: string, timeSpent?: number) => Promise<any>,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }
  const attemptId = req.params.attemptId;
  const attempt = await Repository.quizAttempt.findById(attemptId);

  if (attempt.userId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only modify your own attempts",
      statusCode: 403,
    });
  }

  const result = await action(attemptId, req.body.timeSpent);
  res.status(200).json(result);
};

export const completeQuizAttempt = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  return quizAttemptGeneral(req, res, async (attemptId, timeSpent) => {
    return await Repository.quizAttempt.completeAttempt(attemptId, timeSpent);
  });
};

export const pauseQuizAttempt = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  return quizAttemptGeneral(req, res, async (attemptId, timeSpent) => {
    return await Repository.quizAttempt.pauseAttempt(attemptId, timeSpent);
  });
};

export const abandonQuizAttempt = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  return quizAttemptGeneral(req, res, async (attemptId) => {
    return await Repository.quizAttempt.abandonAttempt(attemptId);
  });
};

export const timeExpiredQuizAttempt = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  return quizAttemptGeneral(req, res, async (attemptId, timeSpent) => {
    return await Repository.quizAttempt.timeExpired(attemptId, timeSpent || 0);
  });
};

export const getQuizAttemptStats = async (req: Request, res: Response) => {
  const quizId = req.params.quizId;

  await Repository.quiz.findById(quizId);

  const stats = await Repository.quizAttempt.getQuestionResponseStats(quizId);
  res.status(200).json(stats);
};
