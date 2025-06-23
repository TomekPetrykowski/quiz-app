import express, { Router } from "express";
import {
  getCategories,
  getCategoryById,
  getCategoryHierarchy,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./controller";
import validateRequest from "@/middleware/validate-request";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/data/request-schemas";
import { protectEndpoint } from "@/middleware/auth";

const categories: Router = express.Router();

// Public routes
categories.get("/", getCategories);
categories.get("/hierarchy", getCategoryHierarchy);
categories.get("/:id", getCategoryById);

// Protected routes - require authentication
categories.post(
  "/",
  protectEndpoint(),
  validateRequest(createCategorySchema),
  createCategory,
);
categories.put(
  "/:id",
  protectEndpoint(),
  validateRequest(updateCategorySchema),
  updateCategory,
);
categories.delete("/:id", protectEndpoint(), deleteCategory);

export default categories;
