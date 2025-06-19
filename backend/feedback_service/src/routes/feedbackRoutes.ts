import express from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validation";
import {
  createFeedback,
  getAllFeedback,
} from "../controllers/feedbackController";

const router = express.Router();

// Create feedback
router.post(
  "/",
  validate([
    body("message")
      .notEmpty()
      .withMessage("Feedback message is required")
      .isLength({ min: 5 })
      .withMessage("Message must be at least 5 characters long"),
  ]),
  createFeedback
);

router.get("/", getAllFeedback);

export default router;
