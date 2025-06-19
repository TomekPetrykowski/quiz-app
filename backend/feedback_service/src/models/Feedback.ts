import mongoose from "mongoose";

export interface IFeedback {
  message: string;
  createdAt: Date;
}

const feedbackSchema = new mongoose.Schema<IFeedback>({
  message: {
    type: String,
    required: true,
    minlength: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);
