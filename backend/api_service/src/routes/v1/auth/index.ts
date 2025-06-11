import express, { Router } from "express";
import { register, login, refreshToken, getProfile } from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  createUserSchema,
  createLoginSchema,
  createRefreshTokenSchema,
} from "@/data/request-schemas";
import { authenticateToken } from "@/middleware/auth";

const users: Router = express.Router();

users.post("/register", validateRequest(createUserSchema), register);
users.post("/login", validateRequest(createLoginSchema), login);
users.post(
  "/refresh-token",
  validateRequest(createRefreshTokenSchema),
  refreshToken,
);

users.get("/profile", authenticateToken, getProfile);

export default users;
