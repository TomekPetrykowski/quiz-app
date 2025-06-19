import express, { Router } from "express";
import {
  getQuizAttempts,
  getQuizAttemptById,
  getUserAttempts,
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  pauseQuizAttempt,
  abandonQuizAttempt,
  timeExpiredQuizAttempt,
  getQuizAttemptStats,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  submitAnswerSchema,
  updateAttemptStatusSchema,
} from "@/data/request-schemas";
import { authenticateToken } from "@/middleware/auth";

const quizAttempts: Router = express.Router();

quizAttempts.get("/", getQuizAttempts);
quizAttempts.get("/user", authenticateToken, getUserAttempts);
quizAttempts.get("/user/:userId", authenticateToken, getUserAttempts);
quizAttempts.get("/:id", getQuizAttemptById);
quizAttempts.get("/quiz/:quizId/stats", getQuizAttemptStats);

quizAttempts.post("/quiz/:quizId/start", authenticateToken, startQuizAttempt);

quizAttempts.post(
  "/:attemptId/submit",
  authenticateToken,
  validateRequest(submitAnswerSchema),
  submitAnswer,
);

quizAttempts.post(
  "/:attemptId/complete",
  authenticateToken,
  validateRequest(updateAttemptStatusSchema),
  completeQuizAttempt,
);

quizAttempts.post(
  "/:attemptId/pause",
  authenticateToken,
  validateRequest(updateAttemptStatusSchema),
  pauseQuizAttempt,
);

quizAttempts.post("/:attemptId/abandon", authenticateToken, abandonQuizAttempt);

quizAttempts.post(
  "/:attemptId/time-expired",
  authenticateToken,
  validateRequest(updateAttemptStatusSchema),
  timeExpiredQuizAttempt,
);

export default quizAttempts;
