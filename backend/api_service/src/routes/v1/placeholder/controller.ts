import { Request, Response } from "express";

export const someFunc = (req: Request, res: Response): void => {
  res.status(200).json({
    message: "Hello, world!",
  });
};
