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
import { protectEndpoint } from "@/middleware/auth";

const quizzes: Router = express.Router();

// Public routes
quizzes.get("/", getQuizzes);
quizzes.get("/:id", getQuizById);

// Protected routes - require authentication
quizzes.post(
  "/",
  protectEndpoint(),
  validateRequest(createQuizSchema),
  createQuiz,
);
quizzes.put(
  "/:id",
  protectEndpoint(),
  validateRequest(updateQuizSchema),
  updateQuiz,
);
quizzes.delete("/:id", protectEndpoint(), deleteQuiz);

// Tag management
quizzes.post(
  "/:id/tags",
  protectEndpoint(),
  validateRequest(quizTagsSchema),
  addQuizTags,
);
quizzes.delete(
  "/:id/tags",
  protectEndpoint(),
  validateRequest(quizTagsSchema),
  removeQuizTags,
);

export default quizzes;
