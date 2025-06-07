import { Request, Response } from "express";
import EntityNotFoundError from "../../../errors/EntityNotFoundError";

export const someFunc = (req: Request, res: Response): void => {
  // throw new Error("This is an error");
  throw new EntityNotFoundError({
    message: "Aqq",
    code: "ERR_NF",
    statusCode: 404,
  });
  res.status(200).json({
    message: "Hello, world!",
  });
};
