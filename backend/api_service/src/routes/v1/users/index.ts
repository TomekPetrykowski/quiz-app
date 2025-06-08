import express, { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./controller";
import validateRequest from "../../../middleware/validate-request";
import {
  createUserSchema,
  updateUserSchema,
} from "../../../data/request-schemas";

const users: Router = express.Router();

users.get("/", getUsers);
users.get("/:id", getUserById);
users.post("/", validateRequest(createUserSchema), createUser);
users.put("/:id", validateRequest(updateUserSchema), updateUser);
users.delete("/:id", deleteUser);

export default users;
