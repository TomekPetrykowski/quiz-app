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
import { protectEndpoint } from "@/middleware/auth";
import { requireRole } from "@/middleware/require-role";

const leaderboards: Router = express.Router();

leaderboards.get("/", getLeaderboards);
leaderboards.get("/:id", getLeaderboardById);
leaderboards.get("/:id/entries", getLeaderboardEntries);

leaderboards.get("/user/position", protectEndpoint(), getUserPosition);
leaderboards.get("/user/:userId/position", protectEndpoint(), getUserPosition);
leaderboards.post(
  "/",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  validateRequest(createLeaderboardSchema),
  createLeaderboard,
);
leaderboards.put(
  "/:id",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  validateRequest(updateLeaderboardSchema),
  updateLeaderboard,
);
leaderboards.delete(
  "/:id",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  deleteLeaderboard,
);
leaderboards.post("/:id/update", protectEndpoint(), updateLeaderboardRankings);
leaderboards.post(
  "/initialize-system",
  protectEndpoint(),
  initializeSystemLeaderboards,
);

export default leaderboards;
