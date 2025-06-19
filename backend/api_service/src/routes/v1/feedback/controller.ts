import { Response } from "express";
import feedbackClient from "@/services/FeedbackService";

export const submitFeedback = async (req: any, res: Response) => {
  const { message } = req.body;
  if (!message || message.length < 5) {
    res.status(400).json({ error: "Message (min 5 chars) is required" });
    return;
  }
  try {
    const result = await feedbackClient.submitFeedback({ message });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error submitting feedback" });
  }
};

export const getAllFeedback = async (_req: any, res: Response) => {
  try {
    const feedback = await feedbackClient.getAllFeedback();
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving feedback" });
  }
};
