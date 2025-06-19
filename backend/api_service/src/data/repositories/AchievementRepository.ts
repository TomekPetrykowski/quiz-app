import { Prisma, AchievementType } from "@prisma/client";
import BaseRepository from "./BaseRepository";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";
import { IPaginationParams } from "./shared/PaginationHelper";
import logger from "@/logger";

type PrismaAchievement = Prisma.AchievementGetPayload<{
  include: {
    _count: {
      select: {
        userAchievements: true;
      };
    };
  };
}>;

type PrismaUserAchievement = Prisma.UserAchievementGetPayload<{
  include: {
    achievement: true;
    user: {
      select: {
        id: true;
        username: true;
        avatar: true;
      };
    };
  };
}>;

export interface IAchievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  icon?: string | null;
  points: number;
  requirement: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  earnedCount?: number;
}

export interface IUserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
  progress?: any | null;
  achievement?: {
    id: string;
    name: string;
    description: string;
    type: AchievementType;
    icon?: string | null;
    points: number;
  };
  user?: {
    id: string;
    username: string;
    avatar?: string | null;
  };
}

export interface IAchievementQueryParams extends IPaginationParams {
  search?: string;
  type?: AchievementType;
  isActive?: boolean;
}

export class AchievementRepository extends BaseRepository<PrismaAchievement> {
  private mapToAchievement(achievement: PrismaAchievement): IAchievement {
    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      type: achievement.type,
      icon: achievement.icon,
      points: achievement.points,
      requirement: achievement.requirement,
      isActive: achievement.isActive,
      createdAt: achievement.createdAt,
      updatedAt: achievement.updatedAt,
      earnedCount: achievement._count?.userAchievements || 0,
    };
  }

  private mapToUserAchievement(
    userAchievement: PrismaUserAchievement,
  ): IUserAchievement {
    return {
      id: userAchievement.id,
      userId: userAchievement.userId,
      achievementId: userAchievement.achievementId,
      earnedAt: userAchievement.earnedAt,
      progress: userAchievement.progress,
      achievement: userAchievement.achievement
        ? {
            id: userAchievement.achievement.id,
            name: userAchievement.achievement.name,
            description: userAchievement.achievement.description,
            type: userAchievement.achievement.type,
            icon: userAchievement.achievement.icon,
            points: userAchievement.achievement.points,
          }
        : undefined,
      user: userAchievement.user
        ? {
            id: userAchievement.user.id,
            username: userAchievement.user.username,
            avatar: userAchievement.user.avatar,
          }
        : undefined,
    };
  }

  async findById(id: string): Promise<IAchievement> {
    const achievement = await this.client.achievement.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userAchievements: true,
          },
        },
      },
    });

    if (!achievement) {
      throw new EntityNotFoundError({
        message: `Achievement not found`,
      });
    }

    return this.mapToAchievement(achievement);
  }

  async findAll(
    queryParams?: IAchievementQueryParams,
  ): Promise<[IAchievement[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      search,
      type,
      isActive,
    } = queryParams || {};

    const where: Prisma.AchievementWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const achievements = await this.client.achievement.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            userAchievements: true,
          },
        },
      },
    });

    const total = await this.client.achievement.count({ where });
    const mappedAchievements = achievements.map((achievement) =>
      this.mapToAchievement(achievement),
    );

    return [mappedAchievements, total];
  }

  async create(
    data: Omit<IAchievement, "id" | "createdAt" | "updatedAt" | "earnedCount">,
  ): Promise<IAchievement> {
    try {
      const achievement = await this.client.achievement.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          icon: data.icon,
          points: data.points || 0,
          requirement: data.requirement,
          isActive: data.isActive ?? true,
        },
        include: {
          _count: {
            select: {
              userAchievements: true,
            },
          },
        },
      });

      return this.mapToAchievement(achievement);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError({
          message: "Achievement name must be unique",
        });
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<IAchievement>): Promise<IAchievement> {
    const existingAchievement = await this.client.achievement.findUnique({
      where: { id },
    });

    if (!existingAchievement) {
      throw new EntityNotFoundError({ message: "Achievement not found" });
    }

    try {
      const updatedAchievement = await this.client.achievement.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          icon: data.icon,
          points: data.points,
          requirement: data.requirement,
          isActive: data.isActive,
        },
        include: {
          _count: {
            select: {
              userAchievements: true,
            },
          },
        },
      });

      return this.mapToAchievement(updatedAchievement);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError({
          message: "Achievement name must be unique",
        });
      }
      throw error;
    }
  }

  async delete(id: string): Promise<IAchievement> {
    const existingAchievement = await this.client.achievement.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userAchievements: true,
          },
        },
      },
    });

    if (!existingAchievement) {
      throw new EntityNotFoundError({ message: "Achievement not found" });
    }

    if (existingAchievement._count.userAchievements > 0) {
      throw new BadRequestError({
        message: "Cannot delete achievement that has been earned by users",
      });
    }

    await this.client.achievement.delete({
      where: { id },
    });

    return this.mapToAchievement(existingAchievement);
  }

  async findUserAchievements(userId: string): Promise<IUserAchievement[]> {
    const userAchievements = await this.client.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      include: {
        achievement: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return userAchievements.map((ua) => this.mapToUserAchievement(ua));
  }

  async awardAchievement(
    userId: string,
    achievementId: string,
    progress?: any,
  ): Promise<IUserAchievement> {
    const user = await this.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new EntityNotFoundError({ message: "User not found" });
    }

    const achievement = await this.client.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new EntityNotFoundError({ message: "Achievement not found" });
    }

    if (!achievement.isActive) {
      throw new BadRequestError({ message: "Achievement is not active" });
    }

    const existingAward = await this.client.userAchievement.findFirst({
      where: {
        userId,
        achievementId,
      },
    });

    if (existingAward) {
      throw new BadRequestError({
        message: "User already has this achievement",
      });
    }

    const userAchievement = await this.client.userAchievement.create({
      data: {
        userId,
        achievementId,
        progress,
      },
      include: {
        achievement: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    await this.client.user.update({
      where: { id: userId },
      data: {
        totalScore: {
          increment: achievement.points,
        },
      },
    });

    return this.mapToUserAchievement(userAchievement);
  }

  async checkAndAwardAchievements(userId: string): Promise<IUserAchievement[]> {
    // This method checks specific achievements criteria and awards them if met
    const user = await this.client.user.findUnique({
      where: { id: userId },
      include: {
        achievements: true,
        quizAttempts: {
          where: { status: "COMPLETED" },
        },
      },
    });

    if (!user) {
      throw new EntityNotFoundError({ message: "User not found" });
    }

    const achievements = await this.client.achievement.findMany({
      where: { isActive: true },
    });

    const earnedAchievementIds = new Set(
      user.achievements.map((ua) => ua.achievementId),
    );

    const newAwards: IUserAchievement[] = [];

    for (const achievement of achievements) {
      if (earnedAchievementIds.has(achievement.id)) {
        continue;
      }

      try {
        const requirement = achievement.requirement as any;
        let shouldAward = false;
        let progress = null;

        switch (achievement.type) {
          case "QUIZ_COMPLETION":
            // TODO: fix for quiz completion not quiz attempts
            if (
              requirement.count &&
              user.quizAttempts.length >= requirement.count
            ) {
              shouldAward = true;
              progress = { completedCount: user.quizAttempts.length };
            }
            break;

          case "SCORE_MILESTONE":
            if (requirement.score && user.totalScore >= requirement.score) {
              shouldAward = true;
              progress = { totalScore: user.totalScore };
            }
            break;

          case "CATEGORY_MASTER":
            if (requirement.categoryId) {
              const categoryAttempts = await this.client.quizAttempt.count({
                where: {
                  userId,
                  status: "COMPLETED",
                  quiz: { categoryId: requirement.categoryId },
                },
              });

              if (requirement.count && categoryAttempts >= requirement.count) {
                shouldAward = true;
                progress = { categoryAttempts };
              }
            }
            break;

          // TODO: More achievement types can be added here
        }

        if (shouldAward) {
          const award = await this.awardAchievement(
            userId,
            achievement.id,
            progress,
          );
          newAwards.push(award);
        }
      } catch (error) {
        logger.error(
          `Error processing achievement ${achievement.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return newAwards;
  }
}
