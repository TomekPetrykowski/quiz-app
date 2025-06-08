type ErrorCode =
  | "ERR_NF"
  | "ERR_VALID"
  | "ERR_AUTH"
  | "ERR_DB"
  | "ERR_UNKNOWN"
  | "ERR_BAD_REQ";

type ValidationError = {
  error: {
    message: string;
    code: ErrorCode;
    errors?: {
      message: string;
    }[];
  };
};
