import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./UserRepository";
import { QuizRepository } from "./QuizRepository";
import { CategoryRepository } from "./CategoryRepository";

const client = new PrismaClient();

const Repository = {
  user: new UserRepository(client),
  quiz: new QuizRepository(client),
  category: new CategoryRepository(client),
};

export default Repository;
