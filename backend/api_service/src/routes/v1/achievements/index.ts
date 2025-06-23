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

const achievements: Router = express.Router();

achievements.get("/", getAchievements);
achievements.get("/user", protectEndpoint(), getUserAchievements);
achievements.get("/:id", getAchievementById);
achievements.get("/user/:userId", protectEndpoint(), getUserAchievements);

achievements.post(
  "/",
  protectEndpoint(),
  validateRequest(createAchievementSchema),
  createAchievement,
);
achievements.put(
  "/:id",
  protectEndpoint(),
  validateRequest(updateAchievementSchema),
  updateAchievement,
);
achievements.delete("/:id", protectEndpoint(), deleteAchievement);
achievements.post("/award", protectEndpoint(), awardAchievement);
achievements.post("/check", protectEndpoint(), checkUserAchievements);
achievements.post("/check/:userId", protectEndpoint(), checkUserAchievements);

export default achievements;
