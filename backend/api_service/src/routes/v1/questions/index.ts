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
import { protectEndpoint } from "@/middleware/auth";

const questions: Router = express.Router();

questions.get("/", getQuestions);
questions.get("/:id", getQuestionById);
questions.get("/quiz/:quizId", getQuestionsByQuizId);

questions.post(
  "/",
  protectEndpoint(),
  validateRequest(createQuestionSchema),
  createQuestion,
);
questions.put(
  "/:id",
  protectEndpoint(),
  validateRequest(updateQuestionSchema),
  updateQuestion,
);
questions.delete("/:id", protectEndpoint(), deleteQuestion);
questions.post(
  "/quiz/:quizId/reorder",
  protectEndpoint(),
  validateRequest(reorderQuestionsSchema),
  reorderQuestions,
);

export default questions;
