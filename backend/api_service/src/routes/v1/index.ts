import express, { Router } from "express";

import users from "./users";
import auth from "./auth";
import quizzes from "./quizzes";
import categories from "./categories";
import tags from "./tags";
import questions from "./questions";
import quizAttempts from "./attempts";
import achievements from "./achievements";
import leaderboards from "./leaderboards";
import feedback from "./feedback";

const v1: Router = express.Router();

v1.use("/auth", auth);

v1.use("/users", users);
v1.use("/quizzes", quizzes);
v1.use("/categories", categories);
v1.use("/tags", tags);
v1.use("/questions", questions);
v1.use("/attempts", quizAttempts);
v1.use("/achievements", achievements);
v1.use("/leaderboards", leaderboards);
v1.use("/feedback", feedback);

export default v1;
