import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import feedbackRoutes from "./routes/feedbackRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/feedback", feedbackRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});
