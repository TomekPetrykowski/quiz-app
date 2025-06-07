const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  debug: process.env.APP_DEBUG === "true",
};

export default config;
