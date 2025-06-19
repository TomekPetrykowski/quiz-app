// filepath: feedback-service/src/controllers/feedbackController.ts
import { Request, Response } from "express";
import { Feedback } from "../models/Feedback";

// Create new feedback
export const createFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message || message.length < 5) {
      res.status(400).json({ error: "Message (min 5 chars) is required" });
      return;
    }
    const feedback = await Feedback.create({ message });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Error creating feedback" });
  }
};

// Get all feedback
export const getAllFeedback = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Error fetching feedback" });
  }
};
