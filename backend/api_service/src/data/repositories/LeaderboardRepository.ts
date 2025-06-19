import { Prisma, LeaderboardType } from "@prisma/client";
import BaseRepository from "./BaseRepository";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";
import { IPaginationParams } from "./shared/PaginationHelper";

type PrismaLeaderboard = Prisma.LeaderboardGetPayload<{
  include: {
    _count: {
      select: {
        entries: true;
      };
    };
  };
}>;

type PrismaLeaderboardEntry = Prisma.LeaderboardEntryGetPayload<{
  include: {
    leaderboard: true;
  };
}>;

export interface ILeaderboard {
  id: string;
  name: string;
  type: LeaderboardType;
  period?: string | null;
  categoryId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  entriesCount?: number;
}

export interface ILeaderboardEntry {
  id: string;
  leaderboardId: string;
  userId: string;
  username?: string;
  avatar?: string | null;
  score: number;
  position: number;
  createdAt: Date;
}

export interface ILeaderboardQueryParams extends IPaginationParams {
  type?: LeaderboardType;
  period?: string;
  categoryId?: string;
  isActive?: boolean;
}

export class LeaderboardRepository extends BaseRepository<PrismaLeaderboard> {
  private mapToLeaderboard(leaderboard: PrismaLeaderboard): ILeaderboard {
    return {
      id: leaderboard.id,
      name: leaderboard.name,
      type: leaderboard.type,
      period: leaderboard.period,
      categoryId: leaderboard.categoryId,
      isActive: leaderboard.isActive,
      createdAt: leaderboard.createdAt,
      updatedAt: leaderboard.updatedAt,
      entriesCount: leaderboard._count?.entries || 0,
    };
  }

  async findById(id: string): Promise<ILeaderboard> {
    const leaderboard = await this.client.leaderboard.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!leaderboard) {
      throw new EntityNotFoundError({
        message: `Leaderboard not found`,
      });
    }

    return this.mapToLeaderboard(leaderboard);
  }

  async findAll(
    queryParams?: ILeaderboardQueryParams,
  ): Promise<[ILeaderboard[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      type,
      period,
      categoryId,
      isActive,
    } = queryParams || {};

    const where: Prisma.LeaderboardWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (period) {
      where.period = period;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const leaderboards = await this.client.leaderboard.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    const total = await this.client.leaderboard.count({ where });
    const mappedLeaderboards = leaderboards.map((leaderboard) =>
      this.mapToLeaderboard(leaderboard),
    );

    return [mappedLeaderboards, total];
  }

  async create(
    data: Omit<ILeaderboard, "id" | "createdAt" | "updatedAt" | "entriesCount">,
  ): Promise<ILeaderboard> {
    const leaderboard = await this.client.leaderboard.create({
      data: {
        name: data.name,
        type: data.type,
        period: data.period,
        categoryId: data.categoryId,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    return this.mapToLeaderboard(leaderboard);
  }

  async update(id: string, data: Partial<ILeaderboard>): Promise<ILeaderboard> {
    const existingLeaderboard = await this.client.leaderboard.findUnique({
      where: { id },
    });

    if (!existingLeaderboard) {
      throw new EntityNotFoundError({ message: "Leaderboard not found" });
    }

    const updatedLeaderboard = await this.client.leaderboard.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        period: data.period,
        categoryId: data.categoryId,
        isActive: data.isActive,
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    return this.mapToLeaderboard(updatedLeaderboard);
  }

  async delete(id: string): Promise<ILeaderboard> {
    const existingLeaderboard = await this.client.leaderboard.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!existingLeaderboard) {
      throw new EntityNotFoundError({ message: "Leaderboard not found" });
    }

    await this.client.leaderboard.delete({
      where: { id },
    });

    return this.mapToLeaderboard(existingLeaderboard);
  }

  async getLeaderboardEntries(
    leaderboardId: string,
    limit = 100,
  ): Promise<ILeaderboardEntry[]> {
    const leaderboard = await this.client.leaderboard.findUnique({
      where: { id: leaderboardId },
    });

    if (!leaderboard) {
      throw new EntityNotFoundError({ message: "Leaderboard not found" });
    }

    const entries = await this.client.leaderboardEntry.findMany({
      where: { leaderboardId },
      take: limit,
      orderBy: { position: "asc" },
    });

    const userIds = [...new Set(entries.map((e) => e.userId))];
    const users = await this.client.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });

    const userMap = new Map();
    users.forEach((user) =>
      userMap.set(user.id, { username: user.username, avatar: user.avatar }),
    );

    return entries.map((entry) => ({
      id: entry.id,
      leaderboardId: entry.leaderboardId,
      userId: entry.userId,
      username: userMap.get(entry.userId)?.username,
      avatar: userMap.get(entry.userId)?.avatar,
      score: entry.score,
      position: entry.position,
      createdAt: entry.createdAt,
    }));
  }

  async updateLeaderboard(leaderboardId: string): Promise<void> {
    const leaderboard = await this.client.leaderboard.findUnique({
      where: { id: leaderboardId },
    });

    if (!leaderboard) {
      throw new EntityNotFoundError({ message: "Leaderboard not found" });
    }

    if (!leaderboard.isActive) {
      return;
    }

    await this.client.leaderboardEntry.deleteMany({
      where: { leaderboardId },
    });

    let userScores: { userId: string; score: number }[] = [];

    switch (leaderboard.type) {
      case "GLOBAL": {
        const users = await this.client.user.findMany({
          select: {
            id: true,
            totalScore: true,
          },
          orderBy: {
            totalScore: "desc",
          },
          take: 100,
        });

        userScores = users.map((user) => ({
          userId: user.id,
          score: user.totalScore,
        }));
        break;
      }

      case "CATEGORY": {
        if (!leaderboard.categoryId) {
          throw new BadRequestError({
            message: "Category ID is required for category leaderboards",
          });
        }

        const categoryScores = await this.client.$queryRaw<
          { userId: string; score: number }[]
        >`
          SELECT 
            "user_id" as "userId",
            SUM("score") as "score"
          FROM 
            "quiz_attempts"
          WHERE 
            "status" = 'COMPLETED' AND
            "quiz_id" IN (
              SELECT "id" FROM "quizzes" WHERE "category_id" = ${leaderboard.categoryId}
            )
          GROUP BY 
            "user_id"
          ORDER BY 
            "score" DESC
          LIMIT 100
        `;

        userScores = categoryScores;
        break;
      }

      case "WEEKLY":
      case "MONTHLY": {
        const dateFilter =
          leaderboard.type === "WEEKLY"
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

        const periodScores = await this.client.$queryRaw<
          { userId: string; score: number }[]
        >`
          SELECT 
            "user_id" as "userId",
            SUM("score") as "score"
          FROM 
            "quiz_attempts"
          WHERE 
            "status" = 'COMPLETED' AND
            "completed_at" >= ${dateFilter}
          GROUP BY 
            "user_id"
          ORDER BY 
            "score" DESC
          LIMIT 100
        `;

        userScores = periodScores.map((entry) => ({
          userId: entry.userId,
          score: parseInt(entry.score as unknown as string, 10),
        }));
        break;
      }
    }

    for (let i = 0; i < userScores.length; i++) {
      const { userId, score } = userScores[i];
      const position = i + 1;

      await this.client.leaderboardEntry.create({
        data: {
          leaderboardId,
          userId,
          score,
          position,
        },
      });
    }
  }

  async initializeSystemLeaderboards(): Promise<ILeaderboard[]> {
    // This method creates standard leaderboards if they don't exist
    const leaderboards: ILeaderboard[] = [];

    // 1. Global leaderboard
    let globalLeaderboard = await this.client.leaderboard.findFirst({
      where: { type: "GLOBAL" },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!globalLeaderboard) {
      globalLeaderboard = await this.client.leaderboard.create({
        data: {
          name: "Global Rankings",
          type: "GLOBAL",
          isActive: true,
        },
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      });

      leaderboards.push(this.mapToLeaderboard(globalLeaderboard));
    } else {
      leaderboards.push(this.mapToLeaderboard(globalLeaderboard));
    }

    // 2. Weekly leaderboard
    let weeklyLeaderboard = await this.client.leaderboard.findFirst({
      where: { type: "WEEKLY" },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!weeklyLeaderboard) {
      weeklyLeaderboard = await this.client.leaderboard.create({
        data: {
          name: "Weekly Challenge",
          type: "WEEKLY",
          period: "weekly",
          isActive: true,
        },
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      });

      leaderboards.push(this.mapToLeaderboard(weeklyLeaderboard));
    } else {
      leaderboards.push(this.mapToLeaderboard(weeklyLeaderboard));
    }

    // 3. Monthly leaderboard
    let monthlyLeaderboard = await this.client.leaderboard.findFirst({
      where: { type: "MONTHLY" },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!monthlyLeaderboard) {
      monthlyLeaderboard = await this.client.leaderboard.create({
        data: {
          name: "Monthly Stars",
          type: "MONTHLY",
          period: "monthly",
          isActive: true,
        },
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      });

      leaderboards.push(this.mapToLeaderboard(monthlyLeaderboard));
    } else {
      leaderboards.push(this.mapToLeaderboard(monthlyLeaderboard));
    }

    // 4. Create category leaderboards for each category
    const categories = await this.client.category.findMany({
      where: { parentId: null }, // Only top-level categories
    });

    for (const category of categories) {
      let categoryLeaderboard = await this.client.leaderboard.findFirst({
        where: {
          type: "CATEGORY",
          categoryId: category.id,
        },
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      });

      if (!categoryLeaderboard) {
        categoryLeaderboard = await this.client.leaderboard.create({
          data: {
            name: `${category.name} Masters`,
            type: "CATEGORY",
            categoryId: category.id,
            isActive: true,
          },
          include: {
            _count: {
              select: {
                entries: true,
              },
            },
          },
        });

        leaderboards.push(this.mapToLeaderboard(categoryLeaderboard));
      } else {
        leaderboards.push(this.mapToLeaderboard(categoryLeaderboard));
      }
    }

    for (const leaderboard of leaderboards) {
      await this.updateLeaderboard(leaderboard.id);
    }

    return leaderboards;
  }

  async getLeaderboardForUser(
    userId: string,
    type: LeaderboardType = "GLOBAL",
    categoryId?: string,
  ): Promise<{ position: number; score: number } | null> {
    const where: Prisma.LeaderboardWhereInput = {
      type,
      isActive: true,
    };

    if (categoryId && type === "CATEGORY") {
      where.categoryId = categoryId;
    }

    const leaderboard = await this.client.leaderboard.findFirst({ where });

    if (!leaderboard) {
      return null;
    }

    const entry = await this.client.leaderboardEntry.findFirst({
      where: {
        leaderboardId: leaderboard.id,
        userId,
      },
    });

    if (!entry) {
      return null;
    }

    return {
      position: entry.position,
      score: entry.score,
    };
  }
}
