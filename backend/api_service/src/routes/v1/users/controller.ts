import { Request, Response, NextFunction } from "express";
import prisma from "../../../prisma-client";
import EntityNotFoundError from "../../../errors/EntityNotFoundError";
import CustomError from "../../../errors/CustomError";

// Get all users with pagination
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          totalScore: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              quizzes: true,
              quizAttempts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        totalScore: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            quizzes: true,
            quizAttempts: true,
            achievements: true,
            groupMemberships: true,
          },
        },
      },
    });

    if (!user) {
      throw new EntityNotFoundError({
        message: "User not found",
        statusCode: 404,
        code: "ERR_NF",
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Create new user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { keycloakId, email, username, firstName, lastName, avatar } =
      req.body;

    // Validate required fields
    if (!keycloakId || !email || !username) {
      throw new CustomError({
        message: "keycloakId, email, and username are required",
        statusCode: 400,
        code: "ERR_VALID",
      });
    }

    const user = await prisma.user.create({
      data: {
        keycloakId,
        email,
        username,
        firstName,
        lastName,
        avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        totalScore: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, avatar } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new EntityNotFoundError({
        message: "User not found",
        statusCode: 404,
        code: "ERR_NF",
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        totalScore: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Deactivate user (soft delete)
export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new EntityNotFoundError({
        message: "User not found",
        statusCode: 404,
        code: "ERR_NF",
      });
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

// Get user's quizzes
export const getUserQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new EntityNotFoundError({
        message: "User not found",
        statusCode: 404,
        code: "ERR_NF",
      });
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where: { authorId: id },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          status: true,
          privacy: true,
          attemptsCount: true,
          averageScore: true,
          averageRating: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.quiz.count({
        where: { authorId: id },
      }),
    ]);

    res.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
