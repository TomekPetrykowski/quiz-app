import express, { Router } from "express";
import { submitFeedback, getAllFeedback } from "./controller";

const feedback: Router = express.Router();

feedback.post("/", submitFeedback);
feedback.get("/", getAllFeedback);

export default feedback;
