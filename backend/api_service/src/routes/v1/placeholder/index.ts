import express, { Router } from "express";
import { someFunc } from "./controller";

const test: Router = express.Router();

test.get("/", someFunc);

export default test;
