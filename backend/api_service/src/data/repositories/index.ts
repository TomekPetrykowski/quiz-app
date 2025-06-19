import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./UserRepository";
import { QuizRepository } from "./QuizRepository";
import { CategoryRepository } from "./CategoryRepository";
import { TagRepository } from "./TagRepository";
import { QuestionRepository } from "./QuestionRepository";
import { QuizAttemptRepository } from "./QuizAttemptRepository";
import { AchievementRepository } from "./AchievementRepository";
import { LeaderboardRepository } from "./LeaderboardRepository";

const client = new PrismaClient();

const Repository = {
  user: new UserRepository(client),
  quiz: new QuizRepository(client),
  category: new CategoryRepository(client),
  tag: new TagRepository(client),
  question: new QuestionRepository(client),
  quizAttempt: new QuizAttemptRepository(client),
  achievement: new AchievementRepository(client),
  leaderboard: new LeaderboardRepository(client),
};

export default Repository;
