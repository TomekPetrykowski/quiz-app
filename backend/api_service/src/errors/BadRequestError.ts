import CustomError from "./CustomError";

export class BadRequestError extends CustomError<ErrorCode> {
  constructor({
    message = "Bad request",
    statusCode = 400,
    code = "ERR_BAD_REQ",
  }: {
    message?: string;
    statusCode?: number;
    code?: ErrorCode;
  } = {}) {
    super({
      message,
      statusCode,
      code,
    });
  }
}
