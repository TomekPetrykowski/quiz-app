import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `Error connecting to MongoDB: ${
        error instanceof Error ? error.message : error
      }`
    );
    process.exit(1);
  }
};
