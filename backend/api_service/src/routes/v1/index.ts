import express, { Router } from "express";
import test from "./placeholder";
import users from "./users";

const v1: Router = express.Router();

v1.use("/test", test);
v1.use("/users", users);

export default v1;
