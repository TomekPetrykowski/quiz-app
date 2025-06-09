import { Request, Response } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "@/routes/v1/users/controller";

import Repository from "@/data/repositories";
import { BadRequestError } from "@/errors/BadRequestError";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { PaginationHelper } from "@/data/repositories/shared/PaginationHelper";

// Mock the PaginationHelper
jest.mock("@/data/repositories/shared/PaginationHelper", () => ({
  PaginationHelper: {
    calculateSkip: jest.fn(),
    buildPaginationResponse: jest.fn(),
  },
}));

describe("User Controller", () => {
  let req: Request;
  let res: Response;
  let mockUser: any;
  let mockUsers: any[];
  let mockTotal: number;
  let mockPaginationResponse: any;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    } as unknown as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    mockUser = {
      id: "user123",
      keycloakId: "keycloak123",
      email: "test@example.com",
      username: "testuser",
      firstName: "John",
      lastName: "Doe",
      avatar: "https://example.com/avatar.jpg",
      totalScore: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers = [mockUser];
    mockTotal = 1;

    mockPaginationResponse = {
      data: mockUsers,
      pagination: {
        page: 1,
        limit: 10,
        total: mockTotal,
        pages: Math.ceil(mockTotal / 10),
      },
    };

    // Reset all repository mocks
    Repository.user.findAll = jest
      .fn()
      .mockResolvedValue([mockUsers, mockTotal]);
    Repository.user.findById = jest.fn().mockResolvedValue(mockUser);
    Repository.user.findByEmail = jest.fn().mockResolvedValue(null);
    Repository.user.findByUsername = jest.fn().mockResolvedValue(null);
    Repository.user.findByKeycloakId = jest.fn().mockResolvedValue(null);
    Repository.user.create = jest.fn().mockResolvedValue(mockUser);
    Repository.user.update = jest.fn().mockResolvedValue(mockUser);
    Repository.user.delete = jest.fn().mockResolvedValue(mockUser);

    (PaginationHelper.calculateSkip as jest.Mock).mockReturnValue(0);
    (PaginationHelper.buildPaginationResponse as jest.Mock).mockReturnValue(
      mockPaginationResponse,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return paginated users with default pagination", async () => {
      await getUsers(req, res);

      expect(PaginationHelper.calculateSkip).toHaveBeenCalledWith(1, 10);
      expect(Repository.user.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(PaginationHelper.buildPaginationResponse).toHaveBeenCalledWith(
        mockUsers,
        mockTotal,
        1,
        10,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPaginationResponse);
    });

    it("should return paginated users with custom pagination", async () => {
      req.query = { page: "2", limit: "5" };

      // Correct mock structure for custom pagination
      const customMockPaginationResponse = {
        data: mockUsers,
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          pages: Math.ceil(10 / 5),
        },
      };

      (PaginationHelper.calculateSkip as jest.Mock).mockReturnValue(5);
      (PaginationHelper.buildPaginationResponse as jest.Mock).mockReturnValue(
        customMockPaginationResponse,
      );

      await getUsers(req, res);

      expect(PaginationHelper.calculateSkip).toHaveBeenCalledWith(2, 5);
      expect(Repository.user.findAll).toHaveBeenCalledWith({
        limit: 5,
        offset: 5,
      });
      expect(PaginationHelper.buildPaginationResponse).toHaveBeenCalledWith(
        mockUsers,
        mockTotal,
        2,
        5,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(customMockPaginationResponse);
    });

    it("should handle invalid pagination parameters gracefully", async () => {
      req.query = { page: "invalid", limit: "invalid" };

      await getUsers(req, res);

      expect(PaginationHelper.calculateSkip).toHaveBeenCalledWith(1, 10);
      expect(Repository.user.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPaginationResponse);
    });
  });

  describe("getUserById", () => {
    it("should return user by id successfully", async () => {
      req.params.id = "user123";

      await getUserById(req, res);

      expect(Repository.user.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should throw error when user not found", async () => {
      req.params.id = "nonexistent";
      Repository.user.findById = jest
        .fn()
        .mockRejectedValue(
          new EntityNotFoundError({ message: "User not found" }),
        );

      await expect(getUserById(req, res)).rejects.toThrow(EntityNotFoundError);
      expect(Repository.user.findById).toHaveBeenCalledWith("nonexistent");
    });
  });

  describe("createUser", () => {
    const validUserData = {
      keycloakId: "keycloak123",
      email: "test@example.com",
      username: "testuser",
      firstName: "John",
      lastName: "Doe",
      avatar: "https://example.com/avatar.jpg",
    };

    it("should create user successfully", async () => {
      req.body = validUserData;

      await createUser(req, res);

      expect(Repository.user.findByEmail).toHaveBeenCalledWith(
        validUserData.email,
      );
      expect(Repository.user.findByUsername).toHaveBeenCalledWith(
        validUserData.username,
      );
      expect(Repository.user.findByKeycloakId).toHaveBeenCalledWith(
        validUserData.keycloakId,
      );
      expect(Repository.user.create).toHaveBeenCalledWith(validUserData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should throw error when email already exists", async () => {
      req.body = validUserData;
      Repository.user.findByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(createUser(req, res)).rejects.toThrow(BadRequestError);
      expect(Repository.user.findByEmail).toHaveBeenCalledWith(
        validUserData.email,
      );
      expect(Repository.user.create).not.toHaveBeenCalled();
    });

    it("should throw error when username already exists", async () => {
      req.body = validUserData;
      Repository.user.findByUsername = jest.fn().mockResolvedValue(mockUser);

      await expect(createUser(req, res)).rejects.toThrow(BadRequestError);
      expect(Repository.user.findByEmail).toHaveBeenCalledWith(
        validUserData.email,
      );
      expect(Repository.user.findByUsername).toHaveBeenCalledWith(
        validUserData.username,
      );
      expect(Repository.user.create).not.toHaveBeenCalled();
    });

    it("should throw error when keycloak id already exists", async () => {
      req.body = validUserData;
      Repository.user.findByKeycloakId = jest.fn().mockResolvedValue(mockUser);

      await expect(createUser(req, res)).rejects.toThrow(BadRequestError);
      expect(Repository.user.findByEmail).toHaveBeenCalledWith(
        validUserData.email,
      );
      expect(Repository.user.findByUsername).toHaveBeenCalledWith(
        validUserData.username,
      );
      expect(Repository.user.findByKeycloakId).toHaveBeenCalledWith(
        validUserData.keycloakId,
      );
      expect(Repository.user.create).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    const updateData = {
      firstName: "Jane",
      lastName: "Smith",
    };

    it("should update user successfully", async () => {
      req.params.id = "user123";
      req.body = updateData;

      await updateUser(req, res);

      expect(Repository.user.update).toHaveBeenCalledWith(
        "user123",
        updateData,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should throw error when user not found for update", async () => {
      req.params.id = "nonexistent";
      req.body = updateData;
      Repository.user.update = jest
        .fn()
        .mockRejectedValue(
          new EntityNotFoundError({ message: "User not found" }),
        );

      await expect(updateUser(req, res)).rejects.toThrow(EntityNotFoundError);
      expect(Repository.user.update).toHaveBeenCalledWith(
        "nonexistent",
        updateData,
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      req.params.id = "user123";

      await deleteUser(req, res);

      expect(Repository.user.delete).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it("should throw error when user not found for deletion", async () => {
      req.params.id = "nonexistent";
      Repository.user.delete = jest
        .fn()
        .mockRejectedValue(
          new EntityNotFoundError({ message: "User not found" }),
        );

      await expect(deleteUser(req, res)).rejects.toThrow(EntityNotFoundError);
      expect(Repository.user.delete).toHaveBeenCalledWith("nonexistent");
    });
  });
});
