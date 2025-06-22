import session from "express-session";
import Keycloak from "keycloak-connect";

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || "quiz-app",
  "auth-server-url": process.env.KEYCLOAK_URL || "http://keycloak:8080",
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT_ID || "api-service",
  "confidential-port": 0,
  "verify-token-audience": false,
  "use-resource-role-mappings": true,
  "bearer-only": true,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
};

// Initialize Keycloak
export const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

// Session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || "some-secret",
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
