import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";

export const auth = () => getServerSession(authOptions);

export { signIn, signOut } from "next-auth/react";
