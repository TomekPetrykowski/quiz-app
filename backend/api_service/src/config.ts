import session from "express-session";
import Keycloak from "keycloak-connect";

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || "",
  "auth-server-url": process.env.KEYCLOAK_URL || "",
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT_ID || "",
  "confidential-port": 0,
  "verify-token-audience": true,
  "bearer-only": true,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
};

export const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || "default",
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
};

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  logLevel: process.env.LOG_LEVEL || "debug",
  debug: process.env.APP_DEBUG === "true",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  feedbackApiUrl: process.env.FEEDBACK_API_URL || "",
};

export default config;
