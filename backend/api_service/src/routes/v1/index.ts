import express, { Router } from "express";
import users from "./users";
import auth from "./auth";
import quizzes from "./quizzes";
import categories from "./categories";

const v1: Router = express.Router();

v1.use("/auth", auth);
v1.use("/users", users);
v1.use("/quizzes", quizzes);
v1.use("/categories", categories);

export default v1;
