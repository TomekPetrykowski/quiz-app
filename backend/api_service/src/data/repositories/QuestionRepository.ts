import { Prisma, QuestionType } from "@prisma/client";
import BaseRepository from "./BaseRepository";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";
import { IPaginationParams } from "./shared/PaginationHelper";

type PrismaQuestion = Prisma.QuestionGetPayload<{
  include: {
    answers: true;
  };
}>;

export interface IQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  explanation?: string | null;
  points: number;
  timeLimit?: number | null;
  order: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  answers?: IAnswer[];
}

export interface IAnswer {
  id?: string;
  questionId?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface IQuestionQueryParams extends IPaginationParams {
  quizId?: string;
  type?: QuestionType;
  search?: string;
}

export class QuestionRepository extends BaseRepository<PrismaQuestion> {
  private mapToQuestion(question: PrismaQuestion): IQuestion {
    return {
      id: question.id,
      quizId: question.quizId,
      type: question.type,
      question: question.question,
      explanation: question.explanation,
      points: question.points,
      timeLimit: question.timeLimit,
      order: question.order,
      isRequired: question.isRequired,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      answers: question.answers
        ? question.answers.map((answer) => ({
            id: answer.id,
            questionId: answer.questionId,
            text: answer.text,
            isCorrect: answer.isCorrect,
            order: answer.order,
          }))
        : [],
    };
  }

  async findById(id: string): Promise<IQuestion> {
    const question = await this.client.question.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!question) {
      throw new EntityNotFoundError({
        message: `Question not found`,
      });
    }

    return this.mapToQuestion(question);
  }

  async findAll(
    queryParams?: IQuestionQueryParams,
  ): Promise<[IQuestion[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      quizId,
      type,
      search,
    } = queryParams || {};

    const where: Prisma.QuestionWhereInput = {};

    if (quizId) where.quizId = quizId;
    if (type) where.type = type;
    if (search) {
      where.question = { contains: search, mode: "insensitive" };
    }

    const questions = await this.client.question.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { order: "asc" },
      include: {
        answers: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    const total = await this.client.question.count({ where });
    const mappedQuestions = questions.map((question) =>
      this.mapToQuestion(question),
    );

    return [mappedQuestions, total];
  }

  async findByQuizId(quizId: string): Promise<IQuestion[]> {
    const questions = await this.client.question.findMany({
      where: { quizId },
      orderBy: { order: "asc" },
      include: {
        answers: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return questions.map((question) => this.mapToQuestion(question));
  }

  async create(
    data: Omit<IQuestion, "id" | "createdAt" | "updatedAt"> & {
      answers: Omit<IAnswer, "id" | "questionId">[];
    },
  ): Promise<IQuestion> {
    const quizExists = await this.client.quiz.findUnique({
      where: { id: data.quizId },
    });

    if (!quizExists) {
      throw new BadRequestError({ message: "Quiz not found" });
    }

    this.validateAnswers(data.type, data.answers);

    const maxOrderQuestion = await this.client.question.findFirst({
      where: { quizId: data.quizId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const order = maxOrderQuestion ? maxOrderQuestion.order + 1 : 1;

    try {
      const question = await this.client.$transaction(async (prisma) => {
        const createdQuestion = await prisma.question.create({
          data: {
            quizId: data.quizId,
            type: data.type,
            question: data.question,
            explanation: data.explanation,
            points: data.points || 1,
            timeLimit: data.timeLimit,
            order: data.order || order,
            isRequired: data.isRequired !== undefined ? data.isRequired : true,
          },
          include: {
            answers: true,
          },
        });

        // Create answers if provided
        if (data.answers && data.answers.length > 0) {
          await prisma.answer.createMany({
            data: data.answers.map((answer, index) => ({
              questionId: createdQuestion.id,
              text: answer.text,
              isCorrect: answer.isCorrect,
              order: answer.order !== undefined ? answer.order : index + 1,
            })),
          });
        }

        return prisma.question.findUnique({
          where: { id: createdQuestion.id },
          include: {
            answers: {
              orderBy: {
                order: "asc",
              },
            },
          },
        });
      });

      if (!question) {
        throw new Error("Failed to create question");
      }

      return this.mapToQuestion(question);
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError({
        message: `Failed to create question: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  }

  async update(
    id: string,
    data: Partial<
      Omit<IQuestion, "id" | "quizId" | "createdAt" | "updatedAt">
    > & {
      answers?: (Omit<IAnswer, "questionId"> & { id?: string })[];
    },
  ): Promise<IQuestion> {
    const existingQuestion = await this.client.question.findUnique({
      where: { id },
      include: { answers: true },
    });

    if (!existingQuestion) {
      throw new EntityNotFoundError({ message: "Question not found" });
    }

    if (
      data.type &&
      data.type !== existingQuestion.type &&
      data.answers &&
      data.answers.length > 0
    ) {
      this.validateAnswers(data.type, data.answers);
    } else if (data.answers && data.answers.length > 0) {
      this.validateAnswers(existingQuestion.type, data.answers);
    }

    try {
      const updatedQuestion = await this.client.$transaction(async (prisma) => {
        const updated = await prisma.question.update({
          where: { id },
          data: {
            type: data.type,
            question: data.question,
            explanation: data.explanation,
            points: data.points,
            timeLimit: data.timeLimit,
            order: data.order,
            isRequired: data.isRequired,
          },
          include: { answers: true },
        });

        if (data.answers) {
          const answerIds = data.answers
            .filter((a) => a.id)
            .map((a) => a.id as string);

          await prisma.answer.deleteMany({
            where: {
              questionId: id,
              id: { notIn: answerIds.length > 0 ? answerIds : undefined },
            },
          });

          for (const answer of data.answers) {
            if (answer.id) {
              await prisma.answer.update({
                where: { id: answer.id },
                data: {
                  text: answer.text,
                  isCorrect: answer.isCorrect,
                  order: answer.order,
                },
              });
            } else {
              await prisma.answer.create({
                data: {
                  questionId: id,
                  text: answer.text,
                  isCorrect: answer.isCorrect,
                  order: answer.order,
                },
              });
            }
          }
        }

        return prisma.question.findUnique({
          where: { id },
          include: {
            answers: {
              orderBy: {
                order: "asc",
              },
            },
          },
        });
      });

      if (!updatedQuestion) {
        throw new Error("Failed to update question");
      }

      return this.mapToQuestion(updatedQuestion);
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof EntityNotFoundError
      ) {
        throw error;
      }
      throw new BadRequestError({
        message: `Failed to update question: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  }

  async delete(id: string): Promise<IQuestion> {
    const existingQuestion = await this.client.question.findUnique({
      where: { id },
      include: { answers: true },
    });

    if (!existingQuestion) {
      throw new EntityNotFoundError({ message: "Question not found" });
    }

    await this.client.question.delete({
      where: { id },
    });

    await this.reorderQuestionsAfterDelete(
      existingQuestion.quizId,
      existingQuestion.order,
    );

    return this.mapToQuestion(existingQuestion);
  }

  async reorderQuestions(
    quizId: string,
    questionOrders: { id: string; order: number }[],
  ): Promise<IQuestion[]> {
    const questions = await this.client.question.findMany({
      where: { quizId },
    });

    const existingIds = new Set(questions.map((q) => q.id));
    const providedIds = new Set(questionOrders.map((q) => q.id));

    for (const id of providedIds) {
      if (!existingIds.has(id)) {
        throw new BadRequestError({
          message: `Question with ID ${id} not found in quiz`,
        });
      }
    }

    await this.client.$transaction(
      questionOrders.map((item) =>
        this.client.question.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return this.findByQuizId(quizId);
  }

  private async reorderQuestionsAfterDelete(
    quizId: string,
    deletedOrder: number,
  ): Promise<void> {
    const questionsToUpdate = await this.client.question.findMany({
      where: {
        quizId,
        order: { gt: deletedOrder },
      },
    });

    await Promise.all(
      questionsToUpdate.map((question) =>
        this.client.question.update({
          where: { id: question.id },
          data: { order: question.order - 1 },
        }),
      ),
    );
  }

  private validateAnswers(
    questionType: QuestionType,
    answers: { text: string; isCorrect: boolean; order: number }[],
  ): void {
    switch (questionType) {
      case "SINGLE_CHOICE":
        if (answers.length < 2) {
          throw new BadRequestError({
            message: "Single choice questions must have at least 2 answers",
          });
        }
        if (answers.filter((a) => a.isCorrect).length !== 1) {
          throw new BadRequestError({
            message:
              "Single choice questions must have exactly one correct answer",
          });
        }
        break;

      case "MULTIPLE_CHOICE":
        if (answers.length < 2) {
          throw new BadRequestError({
            message: "Multiple choice questions must have at least 2 answers",
          });
        }
        if (!answers.some((a) => a.isCorrect)) {
          throw new BadRequestError({
            message:
              "Multiple choice questions must have at least one correct answer",
          });
        }
        break;

      case "TRUE_FALSE":
        if (answers.length !== 2) {
          throw new BadRequestError({
            message: "True/False questions must have exactly 2 answers",
          });
        }
        if (answers.filter((a) => a.isCorrect).length !== 1) {
          throw new BadRequestError({
            message:
              "True/False questions must have exactly one correct answer",
          });
        }
        break;

      case "OPEN_TEXT":
        if (answers.length === 0) {
          throw new BadRequestError({
            message:
              "Open text questions must have at least one correct answer pattern",
          });
        }
        break;

      case "FILL_BLANK":
        if (answers.length === 0) {
          throw new BadRequestError({
            message:
              "Fill in the blank questions must have at least one correct answer",
          });
        }
        break;
    }
  }
}
