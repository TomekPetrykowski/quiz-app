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
import { authenticateToken } from "@/middleware/auth";

const achievements: Router = express.Router();

achievements.get("/", getAchievements);
achievements.get("/user", authenticateToken, getUserAchievements);
achievements.get("/:id", getAchievementById);
achievements.get("/user/:userId", authenticateToken, getUserAchievements);

achievements.post(
  "/",
  authenticateToken,
  validateRequest(createAchievementSchema),
  createAchievement,
);
achievements.put(
  "/:id",
  authenticateToken,
  validateRequest(updateAchievementSchema),
  updateAchievement,
);
achievements.delete("/:id", authenticateToken, deleteAchievement);
achievements.post("/award", authenticateToken, awardAchievement);
achievements.post("/check", authenticateToken, checkUserAchievements);
achievements.post("/check/:userId", authenticateToken, checkUserAchievements);

export default achievements;
