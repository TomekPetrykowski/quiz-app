import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./UserRepository";
import { QuizRepository } from "./QuizRepository";
import { CategoryRepository } from "./CategoryRepository";
import { TagRepository } from "./TagRepository";

const client = new PrismaClient();

const Repository = {
  user: new UserRepository(client),
  quiz: new QuizRepository(client),
  category: new CategoryRepository(client),
  tag: new TagRepository(client),
};

export default Repository;
