import morgan from "morgan";
import logger from "../logger";

morgan.token("status-colored", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // Green
  return `\x1b[37m${status}\x1b[0m`; // White
});

morgan.token("method-colored", (req) => {
  const method = req.method;
  switch (method) {
    case "GET":
      return `\x1b[32m${method}\x1b[0m`; // Green
    case "POST":
      return `\x1b[33m${method}\x1b[0m`; // Yellow
    case "PUT":
      return `\x1b[34m${method}\x1b[0m`; // Blue
    case "DELETE":
      return `\x1b[31m${method}\x1b[0m`; // Red
    case "PATCH":
      return `\x1b[35m${method}\x1b[0m`; // Magenta
    default:
      return `\x1b[37m${method}\x1b[0m`; // White
  }
});

const morganMiddleware = morgan(
  ":method-colored :url :status-colored :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  },
);

export default morganMiddleware;
