import express, { Router } from "express";
import users from "./users";

const v1: Router = express.Router();

v1.use("/users", users);

export default v1;
