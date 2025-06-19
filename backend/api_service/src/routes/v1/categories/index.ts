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
import { authenticateToken } from "@/middleware/auth";

const categories: Router = express.Router();

// Public routes
categories.get("/", getCategories);
categories.get("/hierarchy", getCategoryHierarchy);
categories.get("/:id", getCategoryById);

// Protected routes - require authentication
categories.post(
  "/",
  authenticateToken,
  validateRequest(createCategorySchema),
  createCategory,
);
categories.put(
  "/:id",
  authenticateToken,
  validateRequest(updateCategorySchema),
  updateCategory,
);
categories.delete("/:id", authenticateToken, deleteCategory);

export default categories;
