import express, { Router } from "express";
import { getProfile } from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  createUserSchema,
  createLoginSchema,
  createRefreshTokenSchema,
} from "@/data/request-schemas";
import { authenticateToken, protectEndpoint } from "@/middleware/auth";

const users: Router = express.Router();

users.get("/profile", protectEndpoint("user"), getProfile);

export default users;
