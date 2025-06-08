import { Request, Response } from "express";
import Repository from "../../../data/repositories";
import { PaginationHelper as pagination } from "../../../data/repositories/shared/PaginationHelper";
import { BadRequestError } from "../../../errors/BadRequestError";

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = pagination.calculateSkip(page, limit);

  const queryParams = {
    limit,
    offset,
  };

  const [users, total] = await Repository.user.findAll(queryParams);
  const response = pagination.buildPaginationResponse(
    users,
    total,
    page,
    limit,
  );
  res.status(200).json(response);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await Repository.user.findById(req.params.id);
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

  const existingKeycloakId = await Repository.user.findByKeycloakId(
    req.body.keycloakId,
  );

  if (existingKeycloakId) {
    throw new BadRequestError({
      message: "User already exists",
    });
  }

  const newUser = await Repository.user.create(req.body);
  res.status(201).json(newUser);
};

export const updateUser = async (req: Request, res: Response) => {
  const updatedUser = await Repository.user.update(req.params.id, req.body);
  res.status(200).json(updatedUser);
};

export const deleteUser = async (req: Request, res: Response) => {
  const deletedUser = await Repository.user.delete(req.params.id);
  res.status(200).send(deletedUser);
};
