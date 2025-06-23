import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { BadRequestError } from "@/errors/BadRequestError";

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = pagination.calculateSkip(page, limit);

  const queryParams = {
    limit,
    offset,
  };

  const [users, total] = await Repository.user.findAll(queryParams);

  const usersWithoutPassword = users.map(({ ...user }) => user);

  const response = pagination.buildPaginationResponse(
    usersWithoutPassword,
    total,
    page,
    limit,
  );
  res.status(200).json(response);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await Repository.user.findByIdWithoutPassword(req.params.id);
  res.status(200).json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const existingEmail = await Repository.user.findByEmail(req.body.email);

  if (existingEmail) {
    throw new BadRequestError({
      message: "Email already exists",
    });
  }

  const existingUsername = await Repository.user.findByUsername(
    req.body.username,
  );

  if (existingUsername) {
    throw new BadRequestError({
      message: "Username already exists",
    });
  }

  const newUser = await Repository.user.create(req.body);

  const { ...userWithoutPassword } = newUser;

  res.status(201).json(userWithoutPassword);
};

export const updateUser = async (req: Request, res: Response) => {
  const updatedUser = await Repository.user.update(req.params.id, req.body);

  const { ...userWithoutPassword } = updatedUser;

  res.status(200).json(userWithoutPassword);
};

export const deleteUser = async (req: Request, res: Response) => {
  const deletedUser = await Repository.user.delete(req.params.id);

  if (deletedUser) {
    const { ...userWithoutPassword } = deletedUser;
    res.status(200).send(userWithoutPassword);
  } else {
    res.status(200).send(null);
  }
};

export const updateUserRoles = async (
  req: Request,
  res: Response,
  next: (err?: any) => void,
) => {
  try {
    const userId = req.params.id;
    const { roles } = req.body; // roles: string[]
    if (!Array.isArray(roles) || roles.length === 0) {
      res.status(400).json({ message: "Roles must be a non-empty array" });
      return;
    }
    await Repository.user.setUserRoles(userId, roles);
    res.status(200).json({ message: "User roles updated", roles });
  } catch (err) {
    next(err);
  }
};
