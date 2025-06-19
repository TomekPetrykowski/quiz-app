import { Request, Response } from "express";
import Repository from "@/data/repositories";
import { PaginationHelper as pagination } from "@/data/repositories/shared/PaginationHelper";
import { AuthenticatedRequest } from "@/middleware/auth";

export const getTags = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = pagination.calculateSkip(page, limit);
  const search = req.query.search as string;

  const queryParams = {
    limit,
    offset,
    search,
  };

  const [tags, total] = await Repository.tag.findAll(queryParams);
  const response = pagination.buildPaginationResponse(tags, total, page, limit);

  res.status(200).json(response);
};

export const getTagById = async (req: Request, res: Response) => {
  const tag = await Repository.tag.findById(req.params.id);
  res.status(200).json(tag);
};

export const getPopularTags = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const tags = await Repository.tag.getPopularTags(limit);
  res.status(200).json(tags);
};

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  const tag = await Repository.tag.create(req.body);
  res.status(201).json(tag);
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  const tag = await Repository.tag.update(req.params.id, req.body);
  res.status(200).json(tag);
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  const tag = await Repository.tag.delete(req.params.id);
  res.status(200).json({
    message: "Tag deleted successfully",
    tag,
  });
};
