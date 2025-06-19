import { Prisma } from "@prisma/client";
import BaseRepository from "./BaseRepository";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";
import { IPaginationParams } from "./shared/PaginationHelper";

type PrismaQuiz = Prisma.QuizGetPayload<{
  include: {
    category: true;
    author: {
      select: {
        id: true;
        username: true;
        email: true;
      };
    };
    quizTags: {
      include: {
        tag: true;
      };
    };
  };
}>;

type QuizDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type QuizPrivacy = "PUBLIC" | "PRIVATE" | "GROUP_ONLY";

export interface IQuiz {
  id: string;
  title: string;
  description?: string | null;
  categoryId: string;
  authorId: string;
  difficulty: QuizDifficulty;
  status: QuizStatus;
  privacy: QuizPrivacy;
  timeLimit?: number | null;
  passingScore?: number | null;
  maxAttempts?: number | null;
  isShuffled: boolean;
  showAnswers: boolean;
  attemptsCount: number;
  averageScore?: number | null;
  totalRatings: number;
  averageRating?: number | null;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
  };
  author?: {
    id: string;
    username: string;
    email: string;
  };
  tags?: {
    id: string;
    name: string;
    color?: string | null;
  }[];
}

export interface IQuizQueryParams extends IPaginationParams {
  categoryId?: string;
  authorId?: string;
  difficulty?: string;
  status?: string;
  privacy?: string;
  search?: string;
}

export class QuizRepository extends BaseRepository<PrismaQuiz> {
  private mapToQuiz(quiz: PrismaQuiz): IQuiz {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      categoryId: quiz.categoryId,
      authorId: quiz.authorId,
      difficulty: quiz.difficulty,
      status: quiz.status,
      privacy: quiz.privacy,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      isShuffled: quiz.isShuffled,
      showAnswers: quiz.showAnswers,
      attemptsCount: quiz.attemptsCount,
      averageScore: quiz.averageScore,
      totalRatings: quiz.totalRatings,
      averageRating: quiz.averageRating,
      viewsCount: quiz.viewsCount,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      category: quiz.category
        ? {
            id: quiz.category.id,
            name: quiz.category.name,
          }
        : undefined,
      author: quiz.author
        ? {
            id: quiz.author.id,
            username: quiz.author.username,
            email: quiz.author.email,
          }
        : undefined,
      tags: quiz.quizTags?.map((qt) => ({
        id: qt.tag.id,
        name: qt.tag.name,
        color: qt.tag.color,
      })),
    };
  }

  async findById(id: string): Promise<IQuiz> {
    const quiz = await this.client.quiz.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        quizTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new EntityNotFoundError({
        message: `Quiz not found`,
      });
    }

    return this.mapToQuiz(quiz);
  }

  async findAll(queryParams?: IQuizQueryParams): Promise<[IQuiz[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      categoryId,
      authorId,
      difficulty,
      status,
      privacy,
      search,
    } = queryParams || {};

    const where: Prisma.QuizWhereInput = {};

    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (difficulty) where.difficulty = difficulty as QuizDifficulty;
    if (status) where.status = status as QuizStatus;
    if (privacy) where.privacy = privacy as QuizPrivacy;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const quizzes = await this.client.quiz.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        quizTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const total = await this.client.quiz.count({ where });
    const mappedQuizzes = quizzes.map((quiz) => this.mapToQuiz(quiz));

    return [mappedQuizzes, total];
  }

  async create(
    data: Omit<
      IQuiz,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "attemptsCount"
      | "totalRatings"
      | "viewsCount"
      | "averageRating"
      | "averageScore"
      | "tags"
    >,
  ): Promise<IQuiz> {
    const categoryExists = await this.client.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw new BadRequestError({ message: "Category not found" });
    }

    const quiz = await this.client.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        authorId: data.authorId,
        difficulty: data.difficulty,
        status: data.status || "DRAFT",
        privacy: data.privacy || "PUBLIC",
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
        isShuffled: data.isShuffled ?? false,
        showAnswers: data.showAnswers ?? true,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        quizTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToQuiz(quiz);
  }

  async update(id: string, data: Partial<IQuiz>): Promise<IQuiz> {
    const existingQuiz = await this.client.quiz.findUnique({
      where: { id },
    });

    if (!existingQuiz) {
      throw new EntityNotFoundError({ message: "Quiz not found" });
    }

    if (data.categoryId) {
      const categoryExists = await this.client.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        throw new BadRequestError({ message: "Category not found" });
      }
    }

    const updatedQuiz = await this.client.quiz.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        difficulty: data.difficulty,
        status: data.status,
        privacy: data.privacy,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
        isShuffled: data.isShuffled,
        showAnswers: data.showAnswers,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        quizTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToQuiz(updatedQuiz);
  }

  async delete(id: string): Promise<IQuiz> {
    const existingQuiz = await this.client.quiz.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        quizTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!existingQuiz) {
      throw new EntityNotFoundError({ message: "Quiz not found" });
    }

    await this.client.quiz.delete({
      where: { id },
    });

    return this.mapToQuiz(existingQuiz);
  }

  async addTags(quizId: string, tagIds: string[]): Promise<IQuiz> {
    const existingQuiz = await this.client.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new EntityNotFoundError({ message: "Quiz not found" });
    }

    const tags = await this.client.tag.findMany({
      where: { id: { in: tagIds } },
    });

    if (tags.length !== tagIds.length) {
      throw new BadRequestError({ message: "One or more tags not found" });
    }

    // Create quiz-tag connections
    await Promise.all(
      tagIds.map((tagId) =>
        this.client.quizTag
          .create({
            data: {
              quizId,
              tagId,
            },
          })
          .catch((err) => {
            if (err.code !== "P2002") throw err;
          }),
      ),
    );

    return this.findById(quizId);
  }

  async removeTags(quizId: string, tagIds: string[]): Promise<IQuiz> {
    const existingQuiz = await this.client.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new EntityNotFoundError({ message: "Quiz not found" });
    }

    await this.client.quizTag.deleteMany({
      where: {
        quizId,
        tagId: { in: tagIds },
      },
    });

    return this.findById(quizId);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.client.quiz.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });
  }
}
