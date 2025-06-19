import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./UserRepository";
import { QuizRepository } from "./QuizRepository";
import { CategoryRepository } from "./CategoryRepository";
import { TagRepository } from "./TagRepository";
import { QuestionRepository } from "./QuestionRepository";

const client = new PrismaClient();

const Repository = {
  user: new UserRepository(client),
  quiz: new QuizRepository(client),
  category: new CategoryRepository(client),
  tag: new TagRepository(client),
  question: new QuestionRepository(client),
};

export default Repository;
