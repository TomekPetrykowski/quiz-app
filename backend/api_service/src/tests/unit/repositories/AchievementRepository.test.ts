import { AchievementRepository } from "../../../data/repositories/AchievementRepository";
import { PrismaClient, AchievementType } from "@prisma/client";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";

jest.mock("@prisma/client");

const mockPrisma: any = {
  achievement: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userAchievement: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  quizAttempt: {
    count: jest.fn(),
  },
};

describe("AchievementRepository", () => {
  let repo: AchievementRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AchievementRepository(mockPrisma);
  });

  describe("findById", () => {
    it("returns achievement if found", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "1",
        name: "A",
        description: "desc",
        type: "QUIZ_COMPLETION",
        icon: null,
        points: 10,
        requirement: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { userAchievements: 2 },
      });
      const result = await repo.findById("1");
      expect(result.id).toBe("1");
      expect(result.earnedCount).toBe(2);
    });
    it("throws if not found", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(null);
      await expect(repo.findById("x")).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe("findAll", () => {
    it("returns achievements and total", async () => {
      mockPrisma.achievement.findMany.mockResolvedValue([
        {
          id: "1",
          name: "A",
          description: "desc",
          type: "QUIZ_COMPLETION",
          icon: null,
          points: 10,
          requirement: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { userAchievements: 2 },
        },
      ]);
      mockPrisma.achievement.count.mockResolvedValue(1);
      const [achievements, total] = await repo.findAll();
      expect(achievements).toHaveLength(1);
      expect(total).toBe(1);
    });
  });

  describe("create", () => {
    it("creates and returns achievement", async () => {
      mockPrisma.achievement.create.mockResolvedValue({
        id: "1",
        name: "A",
        description: "desc",
        type: "QUIZ_COMPLETION",
        icon: null,
        points: 10,
        requirement: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { userAchievements: 0 },
      });
      const data = {
        name: "A",
        description: "desc",
        type: "QUIZ_COMPLETION",
        icon: null,
        points: 10,
        requirement: {},
        isActive: true,
      };
      const result = await repo.create(data as any);
      expect(result.name).toBe("A");
    });
  });

  describe("update", () => {
    it("updates and returns achievement", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue({ id: "1" });
      mockPrisma.achievement.update.mockResolvedValue({
        id: "1",
        name: "A",
        description: "desc",
        type: "QUIZ_COMPLETION",
        icon: null,
        points: 10,
        requirement: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { userAchievements: 0 },
      });
      const result = await repo.update("1", { name: "A" });
      expect(result.id).toBe("1");
    });
    it("throws if not found", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(null);
      await expect(repo.update("x", { name: "A" })).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });

  describe("delete", () => {
    it("deletes and returns achievement", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "1",
        _count: { userAchievements: 0 },
        name: "A",
        description: "",
        type: "QUIZ_COMPLETION",
        icon: null,
        points: 0,
        requirement: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.achievement.delete.mockResolvedValue({ id: "1" });
      const result = await repo.delete("1");
      expect(result.id).toBe("1");
    });
    it("throws if not found", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue(null);
      await expect(repo.delete("x")).rejects.toThrow(EntityNotFoundError);
    });
    it("throws if achievement has userAchievements", async () => {
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "1",
        _count: { userAchievements: 1 },
      });
      await expect(repo.delete("1")).rejects.toThrow(BadRequestError);
    });
  });

  describe("findUserAchievements", () => {
    it("returns user achievements", async () => {
      mockPrisma.userAchievement.findMany.mockResolvedValue([
        {
          id: "1",
          userId: "u1",
          achievementId: "a1",
          earnedAt: new Date(),
          progress: null,
          achievement: {
            id: "a1",
            name: "A",
            description: "",
            type: "QUIZ_COMPLETION",
            icon: null,
            points: 0,
          },
          user: { id: "u1", username: "user", avatar: null },
        },
      ]);
      const result = await repo.findUserAchievements("u1");
      expect(result[0].userId).toBe("u1");
    });
  });

  describe("awardAchievement", () => {
    it("awards achievement to user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "a1",
        isActive: true,
        points: 10,
      });
      mockPrisma.userAchievement.findFirst.mockResolvedValue(null);
      mockPrisma.userAchievement.create.mockResolvedValue({
        id: "ua1",
        userId: "u1",
        achievementId: "a1",
        earnedAt: new Date(),
        progress: null,
        achievement: {
          id: "a1",
          name: "A",
          description: "",
          type: "QUIZ_COMPLETION",
          icon: null,
          points: 10,
        },
        user: { id: "u1", username: "user", avatar: null },
      });
      mockPrisma.user.update.mockResolvedValue({});
      const result = await repo.awardAchievement("u1", "a1");
      expect(result.userId).toBe("u1");
      expect(result.achievement?.id).toBe("a1");
    });
    it("throws if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(repo.awardAchievement("u1", "a1")).rejects.toThrow(
        EntityNotFoundError,
      );
    });
    it("throws if achievement not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
      mockPrisma.achievement.findUnique.mockResolvedValue(null);
      await expect(repo.awardAchievement("u1", "a1")).rejects.toThrow(
        EntityNotFoundError,
      );
    });
    it("throws if achievement is not active", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "a1",
        isActive: false,
      });
      await expect(repo.awardAchievement("u1", "a1")).rejects.toThrow(
        BadRequestError,
      );
    });
    it("throws if user already has achievement", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
      mockPrisma.achievement.findUnique.mockResolvedValue({
        id: "a1",
        isActive: true,
      });
      mockPrisma.userAchievement.findFirst.mockResolvedValue({ id: "ua1" });
      await expect(repo.awardAchievement("u1", "a1")).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe("checkAndAwardAchievements", () => {
    it("returns new awards (empty if none)", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        achievements: [],
        quizAttempts: [],
        totalScore: 0,
      });
      mockPrisma.achievement.findMany.mockResolvedValue([]);
      const result = await repo.checkAndAwardAchievements("u1");
      expect(Array.isArray(result)).toBe(true);
    });
    it("throws if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(repo.checkAndAwardAchievements("u1")).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });
});
