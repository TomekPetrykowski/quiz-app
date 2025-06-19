import express, { Router } from "express";
import {
  getTags,
  getTagById,
  getPopularTags,
  createTag,
  updateTag,
  deleteTag,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import { createTagSchema, updateTagSchema } from "@/data/request-schemas";
import { authenticateToken } from "@/middleware/auth";

const tags: Router = express.Router();

tags.get("/", getTags);
tags.get("/popular", getPopularTags);
tags.get("/:id", getTagById);

tags.post("/", authenticateToken, validateRequest(createTagSchema), createTag);
tags.put(
  "/:id",
  authenticateToken,
  validateRequest(updateTagSchema),
  updateTag,
);
tags.delete("/:id", authenticateToken, deleteTag);

export default tags;
