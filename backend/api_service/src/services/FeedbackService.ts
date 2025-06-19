import axios from "axios";
import config from "@/config";
import logger from "@/logger";

const feedbackClient = axios.create({
  baseURL: config.feedbackApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const submitFeedback = async (feedbackData: { message: string }) => {
  try {
    const response = await feedbackClient.post("/feedback", feedbackData);
    console.log("Feedback submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    logger.error(`Error submitting feedback: ${error}`);
    throw error;
  }
};

export const getAllFeedback = async () => {
  try {
    const response = await feedbackClient.get("/feedback");
    console.log("Feedback retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    logger.error(`Error retrieving feedback: ${error}`);
    throw error;
  }
};

export default {
  submitFeedback,
  getAllFeedback,
};
