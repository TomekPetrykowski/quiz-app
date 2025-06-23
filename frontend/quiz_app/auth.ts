import NextAuth, { NextAuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.AUTH_KEYCLOAK_ID!,
        client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at! * 1000,
          user,
        };
      }

      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error) {
        throw new Error("RefreshAccessTokenError");
      }

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.expiresAt = token.expiresAt as number;
      session.error = token.error as string;

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async signOut(message) {
      if (message.token?.accessToken) {
        try {
          await fetch(
            `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${message.token.accessToken}`,
              },
              body: new URLSearchParams({
                client_id: process.env.AUTH_KEYCLOAK_ID!,
                client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
                refresh_token: message.token.refreshToken as string,
              }),
            }
          );
        } catch (error) {
          console.error("Error during Keycloak logout:", error);
        }
      }
    },
  },
};

export default NextAuth(authOptions);
