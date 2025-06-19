const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  logLevel: process.env.LOG_LEVEL || "debug",
  debug: process.env.APP_DEBUG === "true",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
};

export default config;
