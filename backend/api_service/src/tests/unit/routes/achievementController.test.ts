import {
  getAchievements,
  getAchievementById,
  getUserAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  awardAchievement,
  checkUserAchievements,
} from "../../../routes/v1/achievements/controller";
import Repository from "@/data/repositories";
import httpMocks from "node-mocks-http";
import { AuthenticatedRequest } from "@/middleware/auth";

jest.mock("@/data/repositories");

const mockRes = () => {
  const res = httpMocks.createResponse();
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Achievements Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAchievements", () => {
    it("should return paginated achievements", async () => {
      (Repository.achievement.findAll as jest.Mock).mockResolvedValue([
        [{ id: "1" }],
        1,
      ]);
      const req = httpMocks.createRequest({ query: {} });
      const res = mockRes();
      await getAchievements(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: [{ id: "1" }] }),
      );
    });
  });

  describe("getAchievementById", () => {
    it("should return achievement by id", async () => {
      (Repository.achievement.findById as jest.Mock).mockResolvedValue({
        id: "1",
      });
      const req = httpMocks.createRequest({ params: { id: "1" } });
      const res = mockRes();
      await getAchievementById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1" });
    });
  });

  describe("getUserAchievements", () => {
    it("should return user achievements", async () => {
      (
        Repository.achievement.findUserAchievements as jest.Mock
      ).mockResolvedValue([{ id: "ua1", userId: "u1" }]);
      const req = httpMocks.createRequest({
        params: {},
        user: { userId: "u1" },
      });
      const res = mockRes();
      await getUserAchievements(req as AuthenticatedRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: "ua1", userId: "u1" }]);
    });
  });

  describe("createAchievement", () => {
    it("should create and return achievement", async () => {
      (Repository.achievement.create as jest.Mock).mockResolvedValue({
        id: "1",
        name: "A",
      });
      const req = httpMocks.createRequest({
        body: { name: "A" },
        user: { userId: "admin" },
      });
      const res = mockRes();
      await createAchievement(req as AuthenticatedRequest, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "1", name: "A" });
    });
  });

  describe("updateAchievement", () => {
    it("should update and return achievement", async () => {
      (Repository.achievement.update as jest.Mock).mockResolvedValue({
        id: "1",
        name: "A",
      });
      const req = httpMocks.createRequest({
        params: { id: "1" },
        body: { name: "A" },
        user: { userId: "admin" },
      });
      const res = mockRes();
      await updateAchievement(req as AuthenticatedRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1", name: "A" });
    });
  });

  describe("deleteAchievement", () => {
    it("should delete and return achievement", async () => {
      (Repository.achievement.delete as jest.Mock).mockResolvedValue({
        id: "1",
      });
      const req = httpMocks.createRequest({
        params: { id: "1" },
        user: { userId: "admin" },
      });
      const res = mockRes();
      await deleteAchievement(req as AuthenticatedRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        achievement: { id: "1" },
      });
    });
  });

  describe("awardAchievement", () => {
    it("should award achievement to user", async () => {
      (Repository.achievement.awardAchievement as jest.Mock).mockResolvedValue({
        id: "ua1",
        userId: "u1",
        achievementId: "a1",
      });
      const req = httpMocks.createRequest({
        body: { userId: "u1", achievementId: "a1" },
        user: { userId: "admin" },
      });
      const res = mockRes();
      await awardAchievement(req as AuthenticatedRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "ua1",
        userId: "u1",
        achievementId: "a1",
      });
    });
  });

  describe("checkUserAchievements", () => {
    it("should check and return new achievements", async () => {
      (
        Repository.achievement.checkAndAwardAchievements as jest.Mock
      ).mockResolvedValue([{ id: "ua1" }]);
      const req = httpMocks.createRequest({
        params: {},
        user: { userId: "u1" },
      });
      const res = mockRes();
      await checkUserAchievements(req as AuthenticatedRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
        achievements: [{ id: "ua1" }],
      });
    });
  });
});
