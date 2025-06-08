import express, { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getUserQuizzes,
} from "./controller";

const users: Router = express.Router();

users.get("/", getUsers);
users.get("/:id", getUserById);
users.post("/", createUser);
users.put("/:id", updateUser);
users.delete("/:id", deactivateUser);
users.get("/:id/quizzes", getUserQuizzes);

export default users;
