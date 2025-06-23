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
import { protectEndpoint } from "@/middleware/auth";

const tags: Router = express.Router();

tags.get("/", getTags);
tags.get("/popular", getPopularTags);
tags.get("/:id", getTagById);

tags.post("/", protectEndpoint(), validateRequest(createTagSchema), createTag);
tags.put(
  "/:id",
  protectEndpoint(),
  validateRequest(updateTagSchema),
  updateTag,
);
tags.delete("/:id", protectEndpoint(), deleteTag);

export default tags;
