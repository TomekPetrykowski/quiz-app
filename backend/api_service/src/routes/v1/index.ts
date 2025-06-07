import express, { Router } from "express";
import test from "./placeholder";

const v1: Router = express.Router();

v1.use("/test", test);

export default v1;
