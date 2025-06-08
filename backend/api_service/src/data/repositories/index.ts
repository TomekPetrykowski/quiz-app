import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./UserRepository";

const client = new PrismaClient();

const Repository = {
  user: new UserRepository(client),
};

export default Repository;
