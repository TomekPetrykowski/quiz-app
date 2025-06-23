import express, { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRoles,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import { createUserSchema, updateUserSchema } from "@/data/request-schemas";
import { requireRole } from "@/middleware/require-role";
import { protectEndpoint } from "@/middleware/auth";

const users: Router = express.Router();

users.get("/", getUsers);
users.get("/:id", getUserById);
users.post(
  "/",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  validateRequest(createUserSchema),
  createUser,
);
users.put(
  "/:id",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  validateRequest(updateUserSchema),
  updateUser,
);
users.patch(
  "/:id/roles",
  protectEndpoint(),
  requireRole(["admin"]),
  updateUserRoles,
);
users.delete(
  "/:id",
  protectEndpoint(),
  requireRole(["admin", "moderator"]),
  deleteUser,
);

export default users;
