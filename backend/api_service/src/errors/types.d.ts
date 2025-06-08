type ErrorCode = "ERR_NF" | "ERR_VALID";

type ValidationError = {
  error: {
    message: string;
    code: ErrorCode;
    errors?: {
      message: string;
    }[];
  };
};
