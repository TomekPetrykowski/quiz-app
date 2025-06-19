import express, { Router } from "express";
import {
  getQuestions,
  getQuestionById,
  getQuestionsByQuizId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  createQuestionSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
} from "@/data/request-schemas";
import { authenticateToken } from "@/middleware/auth";

const questions: Router = express.Router();

questions.get("/", getQuestions);
questions.get("/:id", getQuestionById);
questions.get("/quiz/:quizId", getQuestionsByQuizId);

questions.post(
  "/",
  authenticateToken,
  validateRequest(createQuestionSchema),
  createQuestion,
);
questions.put(
  "/:id",
  authenticateToken,
  validateRequest(updateQuestionSchema),
  updateQuestion,
);
questions.delete("/:id", authenticateToken, deleteQuestion);
questions.post(
  "/quiz/:quizId/reorder",
  authenticateToken,
  validateRequest(reorderQuestionsSchema),
  reorderQuestions,
);

export default questions;
