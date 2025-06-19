import { Prisma, AttemptStatus, QuestionType } from "@prisma/client";
import BaseRepository from "./BaseRepository";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";
import { IPaginationParams } from "./shared/PaginationHelper";
import logger from "@/logger";

type PrismaQuizAttempt = Prisma.QuizAttemptGetPayload<{
  include: {
    quiz: {
      select: {
        id: true;
        title: true;
        description: true;
        timeLimit: true;
        passingScore: true;
        categoryId: true;
        difficulty: true;
        isShuffled: true;
        showAnswers: true;
        category: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
    user: {
      select: {
        id: true;
        username: true;
      };
    };
    userAnswers: {
      include: {
        question: true;
        answer: true;
      };
    };
  };
}>;

export interface IQuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  status: AttemptStatus;
  score?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  timeSpent?: number | null;
  startedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  quiz?: {
    id: string;
    title: string;
    description?: string | null;
    timeLimit?: number | null;
    passingScore?: number | null;
    categoryId: string;
    difficulty: string;
    isShuffled: boolean;
    showAnswers: boolean;
    category?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    username: string;
  };
  userAnswers?: IUserAnswer[];
}

export interface IUserAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerId?: string | null;
  textAnswer?: string | null;
  isCorrect?: boolean | null;
  pointsEarned: number;
  timeSpent?: number | null;
  createdAt: Date;
  question?: {
    id: string;
    type: string;
    question: string;
    points: number;
    explanation?: string | null;
  };
  answer?: {
    id: string;
    text: string;
    isCorrect: boolean;
  } | null;
}

export interface IQuizAttemptQueryParams extends IPaginationParams {
  userId?: string;
  quizId?: string;
  status?: AttemptStatus;
}

export interface ISubmitAnswerRequest {
  attemptId: string;
  questionId: string;
  answerId?: string | null;
  answerIds?: string[] | null;
  textAnswer?: string | null;
  timeSpent?: number | null;
}

export class QuizAttemptRepository extends BaseRepository<PrismaQuizAttempt> {
  private mapToQuizAttempt(attempt: PrismaQuizAttempt): IQuizAttempt {
    return {
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      status: attempt.status,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      timeSpent: attempt.timeSpent,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
      quiz: attempt.quiz
        ? {
            id: attempt.quiz.id,
            title: attempt.quiz.title,
            description: attempt.quiz.description,
            timeLimit: attempt.quiz.timeLimit,
            passingScore: attempt.quiz.passingScore,
            categoryId: attempt.quiz.categoryId,
            difficulty: attempt.quiz.difficulty,
            isShuffled: attempt.quiz.isShuffled,
            showAnswers: attempt.quiz.showAnswers,
            category: attempt.quiz.category
              ? {
                  id: attempt.quiz.category.id,
                  name: attempt.quiz.category.name,
                }
              : undefined,
          }
        : undefined,
      user: attempt.user
        ? {
            id: attempt.user.id,
            username: attempt.user.username,
          }
        : undefined,
      userAnswers: attempt.userAnswers?.map((ua) => ({
        id: ua.id,
        attemptId: ua.attemptId,
        questionId: ua.questionId,
        answerId: ua.answerId,
        textAnswer: ua.textAnswer,
        isCorrect: ua.isCorrect,
        pointsEarned: ua.pointsEarned,
        timeSpent: ua.timeSpent,
        createdAt: ua.createdAt,
        question: ua.question
          ? {
              id: ua.question.id,
              type: ua.question.type,
              question: ua.question.question,
              points: ua.question.points,
              explanation: ua.question.explanation,
            }
          : undefined,
        answer: ua.answer
          ? {
              id: ua.answer.id,
              text: ua.answer.text,
              isCorrect: ua.answer.isCorrect,
            }
          : undefined,
      })),
    };
  }

  async findById(id: string): Promise<IQuizAttempt> {
    const attempt = await this.client.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new EntityNotFoundError({
        message: `Quiz attempt not found`,
      });
    }

    return this.mapToQuizAttempt(attempt);
  }

  async findAll(
    queryParams?: IQuizAttemptQueryParams,
  ): Promise<[IQuizAttempt[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      userId,
      quizId,
      status,
    } = queryParams || {};

    const where: Prisma.QuizAttemptWhereInput = {};

    if (userId) where.userId = userId;
    if (quizId) where.quizId = quizId;
    if (status) where.status = status;

    const attempts = await this.client.quizAttempt.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    const total = await this.client.quizAttempt.count({ where });
    const mappedAttempts = attempts.map((attempt) =>
      this.mapToQuizAttempt(attempt),
    );

    return [mappedAttempts, total];
  }

  async findUserAttempts(
    userId: string,
    quizId?: string,
  ): Promise<IQuizAttempt[]> {
    const where: Prisma.QuizAttemptWhereInput = { userId };
    if (quizId) where.quizId = quizId;

    logger.info("Finding user attempts with where:", where);
    // console.log("Finding user attempts with where:", where);

    const attempts = await this.client.quizAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    return attempts.map((attempt) => this.mapToQuizAttempt(attempt));
  }

  async findActiveAttempt(
    userId: string,
    quizId: string,
  ): Promise<IQuizAttempt | null> {
    const attempt = await this.client.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
        status: "IN_PROGRESS",
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    if (!attempt) return null;
    return this.mapToQuizAttempt(attempt);
  }

  async startAttempt(userId: string, quizId: string): Promise<IQuizAttempt> {
    const quiz = await this.client.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { answers: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      throw new EntityNotFoundError({ message: "Quiz not found" });
    }

    if (quiz.maxAttempts) {
      const attemptsCount = await this.client.quizAttempt.count({
        where: {
          userId,
          quizId,
          status: { in: ["COMPLETED", "ABANDONED", "TIME_EXPIRED"] },
        },
      });

      if (attemptsCount >= quiz.maxAttempts) {
        throw new BadRequestError({
          message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`,
        });
      }
    }

    const activeAttempt = await this.findActiveAttempt(userId, quizId);
    if (activeAttempt) {
      return activeAttempt;
    }

    const maxScore = quiz.questions.reduce((total, q) => total + q.points, 0);

    const attempt = await this.client.quizAttempt.create({
      data: {
        quizId,
        userId,
        maxScore,
        status: "IN_PROGRESS",
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    await this.client.quiz.update({
      where: { id: quizId },
      data: {
        attemptsCount: {
          increment: 1,
        },
      },
    });

    return this.mapToQuizAttempt(attempt);
  }

  async submitAnswer(data: ISubmitAnswerRequest): Promise<IUserAnswer> {
    const attempt = await this.client.quizAttempt.findUnique({
      where: { id: data.attemptId },
    });

    if (!attempt) {
      throw new EntityNotFoundError({ message: "Quiz attempt not found" });
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestError({
        message: "Cannot submit answers to a completed quiz",
      });
    }

    const question = await this.client.question.findUnique({
      where: { id: data.questionId },
      include: {
        answers: true,
      },
    });

    if (!question) {
      throw new EntityNotFoundError({ message: "Question not found" });
    }

    if (question.quizId !== attempt.quizId) {
      throw new BadRequestError({
        message: "Question does not belong to this quiz",
      });
    }

    const existingAnswer = await this.client.userAnswer.findFirst({
      where: {
        attemptId: data.attemptId,
        questionId: data.questionId,
      },
    });

    if (existingAnswer) {
      return this.updateAnswer(existingAnswer.id, data);
    }

    let isCorrect = false;
    let pointsEarned = 0;
    let answerId = null;

    switch (question.type) {
      case "SINGLE_CHOICE": {
        if (!data.answerId) {
          throw new BadRequestError({
            message: "Answer ID is required for single choice questions",
          });
        }

        const singleChoiceAnswer = question.answers.find(
          (a) => a.id === data.answerId,
        );
        if (!singleChoiceAnswer) {
          throw new BadRequestError({ message: "Invalid answer ID" });
        }

        isCorrect = singleChoiceAnswer.isCorrect;
        answerId = data.answerId;
        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }

      case "MULTIPLE_CHOICE": {
        if (!data.answerIds || !data.answerIds.length) {
          throw new BadRequestError({
            message: "Answer IDs are required for multiple choice questions",
          });
        }

        answerId = data.answerIds[0];

        const selectedAnswers = question.answers.filter((a) =>
          data.answerIds?.includes(a.id),
        );

        const correctAnswers = question.answers.filter((a) => a.isCorrect);
        const selectedIds = new Set(selectedAnswers.map((a) => a.id));

        if (
          selectedAnswers.length === correctAnswers.length &&
          selectedAnswers.every((a) => a.isCorrect) &&
          correctAnswers.every((a) => selectedIds.has(a.id))
        ) {
          isCorrect = true;
          pointsEarned = question.points;
        } else {
          // TODO: partial points here
          isCorrect = false;
          pointsEarned = 0;
        }

        // Format: "answerIds:[id1,id2,id3]"
        data.textAnswer = `answerIds:${JSON.stringify(data.answerIds)}`;
        break;
      }

      case "TRUE_FALSE": {
        if (!data.answerId) {
          throw new BadRequestError({
            message: "Answer ID is required for true/false questions",
          });
        }

        const trueFalseAnswer = question.answers.find(
          (a) => a.id === data.answerId,
        );
        if (!trueFalseAnswer) {
          throw new BadRequestError({ message: "Invalid answer ID" });
        }

        isCorrect = trueFalseAnswer.isCorrect;
        answerId = data.answerId;
        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }

      case "OPEN_TEXT": {
        if (!data.textAnswer) {
          throw new BadRequestError({
            message: "Text answer is required for open text questions",
          });
        }

        // For open text questions, we need to compare with possible correct answers
        const possibleAnswers = question.answers.map((a) =>
          a.text.toLowerCase().trim(),
        );
        const userAnswer = data.textAnswer.toLowerCase().trim();

        isCorrect = possibleAnswers.some((ans) => ans === userAnswer);
        // TODO: Approximate matching here?

        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }
      case "FILL_BLANK": {
        if (!data.textAnswer) {
          throw new BadRequestError({
            message: "Text answer is required for open text questions",
          });
        }

        const possibleAnswers = question.answers.map((a) =>
          a.text.toLowerCase().trim(),
        );
        const userAnswer = data.textAnswer.toLowerCase().trim();

        isCorrect = possibleAnswers.some((ans) => {
          if (ans === userAnswer) return true;

          //TODO: Approximate matching here?

          return false;
        });

        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }
    }

    const userAnswer = await this.client.userAnswer.create({
      data: {
        attemptId: data.attemptId,
        questionId: data.questionId,
        answerId,
        textAnswer: data.textAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: data.timeSpent,
      },
      include: {
        question: true,
        answer: true,
      },
    });

    return {
      id: userAnswer.id,
      attemptId: userAnswer.attemptId,
      questionId: userAnswer.questionId,
      answerId: userAnswer.answerId,
      textAnswer: userAnswer.textAnswer,
      isCorrect: userAnswer.isCorrect,
      pointsEarned: userAnswer.pointsEarned,
      timeSpent: userAnswer.timeSpent,
      createdAt: userAnswer.createdAt,
      question: userAnswer.question
        ? {
            id: userAnswer.question.id,
            type: userAnswer.question.type,
            question: userAnswer.question.question,
            points: userAnswer.question.points,
            explanation: userAnswer.question.explanation,
          }
        : undefined,
      answer: userAnswer.answer
        ? {
            id: userAnswer.answer.id,
            text: userAnswer.answer.text,
            isCorrect: userAnswer.answer.isCorrect,
          }
        : undefined,
    };
  }

  private async updateAnswer(
    userAnswerId: string,
    data: ISubmitAnswerRequest,
  ): Promise<IUserAnswer> {
    const existingUserAnswer = await this.client.userAnswer.findUnique({
      where: { id: userAnswerId },
      include: {
        question: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!existingUserAnswer) {
      throw new EntityNotFoundError({ message: "User answer not found" });
    }

    const question = existingUserAnswer.question;

    let isCorrect = false;
    let pointsEarned = 0;
    let answerId = null;

    switch (question.type) {
      case "SINGLE_CHOICE":
      case "TRUE_FALSE": {
        if (!data.answerId) {
          throw new BadRequestError({ message: "Answer ID is required" });
        }

        const answer = question.answers.find((a) => a.id === data.answerId);
        if (!answer) {
          throw new BadRequestError({ message: "Invalid answer ID" });
        }

        isCorrect = answer.isCorrect;
        answerId = data.answerId;
        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }

      case "MULTIPLE_CHOICE": {
        if (!data.answerIds || !data.answerIds.length) {
          throw new BadRequestError({
            message: "Answer IDs are required for multiple choice questions",
          });
        }

        // Reference for first answerid
        answerId = data.answerIds[0];

        const selectedAnswers = question.answers.filter((a) =>
          data.answerIds?.includes(a.id),
        );

        const correctAnswers = question.answers.filter((a) => a.isCorrect);

        const selectedIds = new Set(selectedAnswers.map((a) => a.id));

        if (
          selectedAnswers.length === correctAnswers.length &&
          selectedAnswers.every((a) => a.isCorrect) &&
          correctAnswers.every((a) => selectedIds.has(a.id))
        ) {
          isCorrect = true;
          pointsEarned = question.points;
        } else {
          isCorrect = false;
          pointsEarned = 0;
        }

        data.textAnswer = `answerIds:${JSON.stringify(data.answerIds)}`;
        break;
      }

      case "OPEN_TEXT":
      case "FILL_BLANK": {
        if (!data.textAnswer) {
          throw new BadRequestError({
            message: "Text answer is required for open text questions",
          });
        }

        const possibleAnswers = question.answers.map((a) =>
          a.text.toLowerCase().trim(),
        );
        const userAnswer = data.textAnswer.toLowerCase().trim();

        isCorrect = possibleAnswers.some((ans) => ans === userAnswer);
        // TODO: Approximate matching here?

        if (isCorrect) {
          pointsEarned = question.points;
        }
        break;
      }
    }

    const updatedAnswer = await this.client.userAnswer.update({
      where: { id: userAnswerId },
      data: {
        answerId,
        textAnswer: data.textAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: data.timeSpent,
      },
      include: {
        question: true,
        answer: true,
      },
    });

    return {
      id: updatedAnswer.id,
      attemptId: updatedAnswer.attemptId,
      questionId: updatedAnswer.questionId,
      answerId: updatedAnswer.answerId,
      textAnswer: updatedAnswer.textAnswer,
      isCorrect: updatedAnswer.isCorrect,
      pointsEarned: updatedAnswer.pointsEarned,
      timeSpent: updatedAnswer.timeSpent,
      createdAt: updatedAnswer.createdAt,
      question: updatedAnswer.question
        ? {
            id: updatedAnswer.question.id,
            type: updatedAnswer.question.type,
            question: updatedAnswer.question.question,
            points: updatedAnswer.question.points,
            explanation: updatedAnswer.question.explanation,
          }
        : undefined,
      answer: updatedAnswer.answer
        ? {
            id: updatedAnswer.answer.id,
            text: updatedAnswer.answer.text,
            isCorrect: updatedAnswer.answer.isCorrect,
          }
        : undefined,
    };
  }

  async completeAttempt(
    attemptId: string,
    timeSpent?: number,
  ): Promise<IQuizAttempt> {
    const attempt = await this.client.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        userAnswers: true,
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new EntityNotFoundError({ message: "Quiz attempt not found" });
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestError({
        message: "Quiz attempt is not in progress",
      });
    }

    const score = attempt.userAnswers.reduce(
      (total, ans) => total + ans.pointsEarned,
      0,
    );
    const maxScore = attempt.quiz.questions.reduce(
      (total, q) => total + q.points,
      0,
    );
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    const completedAttempt = await this.client.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        score,
        maxScore,
        percentage,
        timeSpent: timeSpent || attempt.timeSpent,
        completedAt: new Date(),
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            averageScore: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    await this.updateQuizAverageScore(attempt.quizId);

    await this.client.user.update({
      where: { id: attempt.userId },
      data: {
        totalScore: {
          increment: score,
        },
      },
    });

    return this.mapToQuizAttempt(completedAttempt);
  }

  async pauseAttempt(
    attemptId: string,
    timeSpent?: number,
  ): Promise<IQuizAttempt> {
    const attempt = await this.client.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new EntityNotFoundError({ message: "Quiz attempt not found" });
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestError({ message: "Quiz attempt is not in progress" });
    }

    const pausedAttempt = await this.client.quizAttempt.update({
      where: { id: attemptId },
      data: {
        timeSpent,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    return this.mapToQuizAttempt(pausedAttempt);
  }

  async abandonAttempt(attemptId: string): Promise<IQuizAttempt> {
    const attempt = await this.client.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new EntityNotFoundError({ message: "Quiz attempt not found" });
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestError({ message: "Quiz attempt is not in progress" });
    }

    const abandonedAttempt = await this.client.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "ABANDONED",
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    return this.mapToQuizAttempt(abandonedAttempt);
  }

  async timeExpired(
    attemptId: string,
    timeSpent: number,
  ): Promise<IQuizAttempt> {
    const attempt = await this.client.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        userAnswers: true,
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new EntityNotFoundError({ message: "Quiz attempt not found" });
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestError({ message: "Quiz attempt is not in progress" });
    }

    const score = attempt.userAnswers.reduce(
      (total, ans) => total + ans.pointsEarned,
      0,
    );
    const maxScore = attempt.quiz.questions.reduce(
      (total, q) => total + q.points,
      0,
    );
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    const expiredAttempt = await this.client.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "TIME_EXPIRED",
        score,
        maxScore,
        percentage,
        timeSpent,
        completedAt: new Date(),
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            difficulty: true,
            isShuffled: true,
            showAnswers: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        userAnswers: {
          include: {
            question: true,
            answer: true,
          },
        },
      },
    });

    await this.updateQuizAverageScore(attempt.quizId);

    await this.client.user.update({
      where: { id: attempt.userId },
      data: {
        totalScore: {
          increment: score,
        },
      },
    });

    return this.mapToQuizAttempt(expiredAttempt);
  }

  private async updateQuizAverageScore(quizId: string): Promise<void> {
    const result = await this.client.quizAttempt.aggregate({
      where: {
        quizId,
        status: { in: ["COMPLETED", "TIME_EXPIRED"] },
        score: { not: null },
      },
      _avg: {
        percentage: true,
      },
      _count: true,
    });

    if (result._count > 0 && result._avg.percentage !== null) {
      await this.client.quiz.update({
        where: { id: quizId },
        data: {
          averageScore: result._avg.percentage,
        },
      });
    }
  }

  async getQuestionResponseStats(quizId: string): Promise<any[]> {
    const questions = await this.client.question.findMany({
      where: { quizId },
      include: { answers: true },
    });

    const stats = [];

    for (const question of questions) {
      const userAnswers = await this.client.userAnswer.findMany({
        where: {
          questionId: question.id,
          attempt: {
            status: { in: ["COMPLETED", "TIME_EXPIRED"] },
          },
        },
      });

      const totalAnswers = userAnswers.length;
      const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
      const correctPercentage =
        totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      stats.push({
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalAnswers,
        correctAnswers,
        correctPercentage,
      });
    }

    return stats;
  }
}
