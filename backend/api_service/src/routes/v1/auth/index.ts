import express, { Router } from "express";
import { getProfile } from "./controller";
import { protectEndpoint } from "@/middleware/auth";

const users: Router = express.Router();

users.get("/profile", protectEndpoint(), getProfile);

export default users;
