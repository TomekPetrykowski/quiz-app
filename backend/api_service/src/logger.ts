import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "./config";

const logLevels = {
  error: 0,
  warning: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warning: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(logColors);

const stripAnsiCodes = winston.format((info) => {
  if (typeof info.message === "string") {
    // eslint-disable-next-line no-control-regex
    info.message = info.message.replace(/\x1b\[[0-9;]*m/g, "");
  }
  return info;
});

const consoleFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, logMetadata, stack }) => {
    return `${timestamp} ${level}: ${logMetadata || ""} ${message} ${stack || ""}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  stripAnsiCodes(),
  winston.format.timestamp(),
  winston.format.json(),
);

const logger = winston.createLogger({
  levels: logLevels,
  level: config.logLevel,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

const fileRotateTransport = new DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: fileFormat,
});
logger.add(fileRotateTransport);

export default logger;
