import express, { Router } from "express";
import {
  getLeaderboards,
  getLeaderboardById,
  getLeaderboardEntries,
  getUserPosition,
  createLeaderboard,
  updateLeaderboard,
  deleteLeaderboard,
  updateLeaderboardRankings,
  initializeSystemLeaderboards,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  createLeaderboardSchema,
  updateLeaderboardSchema,
} from "@/data/request-schemas";
import { authenticateToken } from "@/middleware/auth";

const leaderboards: Router = express.Router();

leaderboards.get("/", getLeaderboards);
leaderboards.get("/:id", getLeaderboardById);
leaderboards.get("/:id/entries", getLeaderboardEntries);

leaderboards.get("/user/position", authenticateToken, getUserPosition);
leaderboards.get("/user/:userId/position", authenticateToken, getUserPosition);
leaderboards.post(
  "/",
  authenticateToken,
  validateRequest(createLeaderboardSchema),
  createLeaderboard,
);
leaderboards.put(
  "/:id",
  authenticateToken,
  validateRequest(updateLeaderboardSchema),
  updateLeaderboard,
);
leaderboards.delete("/:id", authenticateToken, deleteLeaderboard);
leaderboards.post("/:id/update", authenticateToken, updateLeaderboardRankings);
leaderboards.post(
  "/initialize-system",
  authenticateToken,
  initializeSystemLeaderboards,
);

export default leaderboards;
