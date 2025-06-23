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
import { protectEndpoint } from "@/middleware/auth";

const quizAttempts: Router = express.Router();

quizAttempts.get("/", getQuizAttempts);
quizAttempts.get("/user", protectEndpoint(), getUserAttempts);
quizAttempts.get("/user/:userId", protectEndpoint(), getUserAttempts);
quizAttempts.get("/:id", getQuizAttemptById);
quizAttempts.get("/quiz/:quizId/stats", getQuizAttemptStats);

quizAttempts.post("/quiz/:quizId/start", protectEndpoint(), startQuizAttempt);

quizAttempts.post(
  "/:attemptId/submit",
  protectEndpoint(),
  validateRequest(submitAnswerSchema),
  submitAnswer,
);

quizAttempts.post(
  "/:attemptId/complete",
  protectEndpoint(),
  validateRequest(updateAttemptStatusSchema),
  completeQuizAttempt,
);

quizAttempts.post(
  "/:attemptId/pause",
  protectEndpoint(),
  validateRequest(updateAttemptStatusSchema),
  pauseQuizAttempt,
);

quizAttempts.post("/:attemptId/abandon", protectEndpoint(), abandonQuizAttempt);

quizAttempts.post(
  "/:attemptId/time-expired",
  protectEndpoint(),
  validateRequest(updateAttemptStatusSchema),
  timeExpiredQuizAttempt,
);

export default quizAttempts;
