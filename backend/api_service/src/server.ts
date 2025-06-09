import express, { Request, Response } from "express";
import morganMiddleware from "./middleware/morgan";
import cors from "cors";
import config from "./config";
import v1 from "./routes/v1";
import errorHandler from "./middleware/error-handler";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morganMiddleware)
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors());

  app.get("/health", (req: Request, res: Response) => {
    res.json({ ok: true, environment: config.env });
    console.log("Health check endpoint hit");
  });

  app.use("/v1", v1);

  app.use(errorHandler);

  return app;
};
