import { authOptions } from "../../../../../auth";
import NextAuth from "next-auth";

const authHandler = NextAuth(authOptions);

export const GET = authHandler;
export const POST = authHandler;
