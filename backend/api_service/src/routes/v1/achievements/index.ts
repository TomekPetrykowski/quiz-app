import express, { Router } from "express";
import {
  getAchievements,
  getAchievementById,
  getUserAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  awardAchievement,
  checkUserAchievements,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  createAchievementSchema,
  updateAchievementSchema,
} from "@/data/request-schemas";
import { protectEndpoint } from "@/middleware/auth";
import { requireRole } from "@/middleware/require-role";

const achievements: Router = express.Router();

achievements.get("/", getAchievements);
achievements.get("/user", protectEndpoint(), getUserAchievements);
achievements.get("/:id", getAchievementById);
achievements.get("/user/:userId", protectEndpoint(), getUserAchievements);

achievements.post(
  "/",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  validateRequest(createAchievementSchema),
  createAchievement,
);
achievements.put(
  "/:id",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  validateRequest(updateAchievementSchema),
  updateAchievement,
);
achievements.delete(
  "/:id",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  deleteAchievement,
);
achievements.post(
  "/award",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  awardAchievement,
);
achievements.get("/check", protectEndpoint(), checkUserAchievements);
achievements.get("/check/:userId", protectEndpoint(), checkUserAchievements);

export default achievements;
