import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { AuthenticatedRequest } from "@/middleware/auth";

export const getCategories = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50; // Higher limit for categories
  const offset = pagination.calculateSkip(page, limit);
  const search = req.query.search as string;

  const parentId =
    req.query.parentId === "null"
      ? null
      : (req.query.parentId as string | undefined);

  const queryParams = {
    limit,
    offset,
    search,
    parentId,
  };

  const [categories, total] = await Repository.category.findAll(queryParams);

  const response = pagination.buildPaginationResponse(
    categories,
    total,
    page,
    limit,
  );

  res.status(200).json(response);
};

export const getCategoryById = async (req: Request, res: Response) => {
  const category = await Repository.category.findById(req.params.id);
  res.status(200).json(category);
};

export const getCategoryHierarchy = async (req: Request, res: Response) => {
  const hierarchy = await Repository.category.getHierarchy();
  res.status(200).json(hierarchy);
};

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const category = await Repository.category.create(req.body);
  res.status(201).json(category);
};

export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const category = await Repository.category.update(req.params.id, req.body);
  res.status(200).json(category);
};

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const category = await Repository.category.delete(req.params.id);
  res.status(200).json({
    message: "Category deleted successfully",
    category,
  });
};
