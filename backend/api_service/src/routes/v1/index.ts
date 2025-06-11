import express, { Router } from "express";
import users from "./users";
import auth from "./auth";

const v1: Router = express.Router();

v1.use("/auth", auth);
v1.use("/users", users);

export default v1;
