import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { BadRequestError } from "@/errors/BadRequestError";
import AuthenticationError from "@/errors/AuthenticationError";
import { AuthenticatedRequest } from "@/middleware/auth";

export const getQuizzes = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = pagination.calculateSkip(page, limit);
  const categoryId = req.query.categoryId as string;
  const authorId = req.query.authorId as string;
  const difficulty = req.query.difficulty as string;
  const status = req.query.status as string;
  const privacy = req.query.privacy as string;
  const search = req.query.search as string;

  const queryParams = {
    limit,
    offset,
    categoryId,
    authorId,
    difficulty,
    status,
    privacy,
    search,
  };

  const [quizzes, total] = await Repository.quiz.findAll(queryParams);

  const response = pagination.buildPaginationResponse(
    quizzes,
    total,
    page,
    limit,
  );

  res.status(200).json(response);
};

export const getQuizById = async (req: Request, res: Response) => {
  const quiz = await Repository.quiz.findById(req.params.id);

  await Repository.quiz.incrementViewCount(req.params.id);

  res.status(200).json(quiz);
};

export const createQuiz = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const quizData = {
    ...req.body,
    authorId: req.user.userId,
  };

  const quiz = await Repository.quiz.create(quizData);
  res.status(201).json(quiz);
};

export const updateQuiz = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const existingQuiz = await Repository.quiz.findById(req.params.id);
  if (existingQuiz.authorId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only edit your own quizzes",
      statusCode: 403,
    });
  }

  const quiz = await Repository.quiz.update(req.params.id, req.body);
  res.status(200).json(quiz);
};

export const deleteQuiz = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const existingQuiz = await Repository.quiz.findById(req.params.id);
  if (existingQuiz.authorId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only delete your own quizzes",
      statusCode: 403,
    });
  }

  const quiz = await Repository.quiz.delete(req.params.id);
  res.status(200).json({
    message: "Quiz deleted successfully",
    quiz,
  });
};

export const addQuizTags = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  // Verify ownership
  const existingQuiz = await Repository.quiz.findById(req.params.id);
  if (existingQuiz.authorId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only modify your own quizzes",
      statusCode: 403,
    });
  }

  const { tagIds } = req.body;
  const quiz = await Repository.quiz.addTags(req.params.id, tagIds);

  res.status(200).json(quiz);
};

export const removeQuizTags = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  // Verify ownership
  const existingQuiz = await Repository.quiz.findById(req.params.id);
  if (existingQuiz.authorId !== req.user.userId) {
    throw new BadRequestError({
      message: "You can only modify your own quizzes",
      statusCode: 403,
    });
  }

  const { tagIds } = req.body;
  const quiz = await Repository.quiz.removeTags(req.params.id, tagIds);

  res.status(200).json(quiz);
};
