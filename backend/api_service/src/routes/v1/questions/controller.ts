import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { BadRequestError } from "@/errors/BadRequestError";
import AuthenticationError from "@/errors/AuthenticationError";
import { AuthenticatedRequest } from "@/middleware/auth";

export const getQuestions = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = pagination.calculateSkip(page, limit);
  const quizId = req.query.quizId as string;
  const type = req.query.type as any;
  const search = req.query.search as string;

  if (!quizId) {
    throw new BadRequestError({ message: "Quiz ID is required" });
  }

  await Repository.quiz.findById(quizId);

  const queryParams = {
    limit,
    offset,
    quizId,
    type,
    search,
  };

  const [questions, total] = await Repository.question.findAll(queryParams);

  const response = pagination.buildPaginationResponse(
    questions,
    total,
    page,
    limit,
  );

  res.status(200).json(response);
};

export const getQuestionById = async (req: Request, res: Response) => {
  const question = await Repository.question.findById(req.params.id);
  res.status(200).json(question);
};

export const getQuestionsByQuizId = async (req: Request, res: Response) => {
  const quizId = req.params.quizId;

  await Repository.quiz.findById(quizId);

  const questions = await Repository.question.findByQuizId(quizId);
  res.status(200).json(questions);
};

export const createQuestion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const { quizId } = req.body;

  const quiz = await Repository.quiz.findById(quizId);
  if (quiz.authorId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only add questions to your own quizzes",
      statusCode: 403,
    });
  }

  const question = await Repository.question.create(req.body);
  res.status(201).json(question);
};

export const updateQuestion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const questionId = req.params.id;
  const existingQuestion = await Repository.question.findById(questionId);
  const quiz = await Repository.quiz.findById(existingQuestion.quizId);

  if (quiz.authorId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only modify questions in your own quizzes",
      statusCode: 403,
    });
  }

  const question = await Repository.question.update(questionId, req.body);
  res.status(200).json(question);
};

export const deleteQuestion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    throw new AuthenticationError({
      message: "User not authenticated",
      statusCode: 401,
    });
  }

  const questionId = req.params.id;
  const existingQuestion = await Repository.question.findById(questionId);
  const quiz = await Repository.quiz.findById(existingQuestion.quizId);

  if (quiz.authorId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only delete questions in your own quizzes",
      statusCode: 403,
    });
  }

  const question = await Repository.question.delete(questionId);
  res.status(200).json({
    message: "Question deleted successfully",
    question,
  });
};

export const reorderQuestions = async (
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

  const quiz = await Repository.quiz.findById(quizId);
  if (quiz.authorId !== req.user.userId) {
    throw new AuthenticationError({
      message: "You can only reorder questions in your own quizzes",
      statusCode: 403,
    });
  }

  const { questions } = req.body;
  const updatedQuestions = await Repository.question.reorderQuestions(
    quizId,
    questions,
  );

  res.status(200).json({
    message: "Questions reordered successfully",
    questions: updatedQuestions,
  });
};
