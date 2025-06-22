import express, { Router } from "express";
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuizTags,
  removeQuizTags,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  createQuizSchema,
  updateQuizSchema,
  quizTagsSchema,
} from "@/data/request-schemas";
import { authenticateToken, protectEndpoint } from "@/middleware/auth";

const quizzes: Router = express.Router();

// Public routes
quizzes.get("/", protectEndpoint(), getQuizzes);
quizzes.get("/:id", getQuizById);

// Protected routes - require authentication
quizzes.post(
  "/",
  authenticateToken,
  validateRequest(createQuizSchema),
  createQuiz,
);
quizzes.put(
  "/:id",
  authenticateToken,
  validateRequest(updateQuizSchema),
  updateQuiz,
);
quizzes.delete("/:id", authenticateToken, deleteQuiz);

// Tag management
quizzes.post(
  "/:id/tags",
  authenticateToken,
  validateRequest(quizTagsSchema),
  addQuizTags,
);
quizzes.delete(
  "/:id/tags",
  authenticateToken,
  validateRequest(quizTagsSchema),
  removeQuizTags,
);

export default quizzes;
