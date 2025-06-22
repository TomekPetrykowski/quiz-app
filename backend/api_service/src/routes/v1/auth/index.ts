import express, { Router } from "express";
import { getProfile } from "./controller";
import { keycloak } from "@/config";
import { AuthenticatedRequest, protectEndpoint } from "@/middleware/auth";

const users: Router = express.Router();

users.get("/profile", protectEndpoint(), getProfile);

export default users;
