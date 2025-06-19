import { Prisma } from "@prisma/client";
import BaseRepository from "./BaseRepository";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";
import { IPaginationParams } from "./shared/PaginationHelper";

type PrismaCategory = Prisma.CategoryGetPayload<{
  include: {
    parent: true;
    _count: {
      select: {
        quizzes: true;
        children: true;
      };
    };
  };
}>;

export interface ICategory {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  parent?: {
    id: string;
    name: string;
  };
  quizzesCount?: number;
  childrenCount?: number;
}

export interface ICategoryQueryParams extends IPaginationParams {
  search?: string;
  parentId?: string | null;
}

export class CategoryRepository extends BaseRepository<PrismaCategory> {
  private mapToCategory(category: PrismaCategory): ICategory {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      parent: category.parent
        ? {
            id: category.parent.id,
            name: category.parent.name,
          }
        : undefined,
      quizzesCount: category._count?.quizzes || 0,
      childrenCount: category._count?.children || 0,
    };
  }

  async findById(id: string): Promise<ICategory> {
    const category = await this.client.category.findUnique({
      where: { id },
      include: {
        parent: true,
        _count: {
          select: {
            quizzes: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      throw new EntityNotFoundError({
        message: `Category not found`,
      });
    }

    return this.mapToCategory(category);
  }

  async findAll(
    queryParams?: ICategoryQueryParams,
  ): Promise<[ICategory[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      search,
      parentId,
    } = queryParams || {};

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // If parentId is explicitly null, find root categories
    // If parentId is undefined, find all categories
    // Otherwise, find categories with the specified parentId
    if (parentId === null) {
      where.parentId = null;
    } else if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const categories = await this.client.category.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        parent: true,
        _count: {
          select: {
            quizzes: true,
            children: true,
          },
        },
      },
    });

    const total = await this.client.category.count({ where });
    const mappedCategories = categories.map((category) =>
      this.mapToCategory(category),
    );

    return [mappedCategories, total];
  }

  async create(
    data: Omit<
      ICategory,
      "id" | "createdAt" | "updatedAt" | "quizzesCount" | "childrenCount"
    >,
  ): Promise<ICategory> {
    if (data.parentId) {
      const parentExists = await this.client.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentExists) {
        throw new BadRequestError({ message: "Parent category not found" });
      }
    }

    try {
      const category = await this.client.category.create({
        data: {
          name: data.name,
          description: data.description,
          parentId: data.parentId,
        },
        include: {
          parent: true,
          _count: {
            select: {
              quizzes: true,
              children: true,
            },
          },
        },
      });

      return this.mapToCategory(category);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError({ message: "Category name must be unique" });
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const existingCategory = await this.client.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new EntityNotFoundError({ message: "Category not found" });
    }

    if (data.parentId) {
      const parentExists = await this.client.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentExists) {
        throw new BadRequestError({ message: "Parent category not found" });
      }

      if (data.parentId === id) {
        throw new BadRequestError({
          message: "Category cannot be its own parent",
        });
      }

      const isDescendant = await this.isDescendant(data.parentId, id);
      if (isDescendant) {
        throw new BadRequestError({
          message: "Cannot set a descendant as parent (circular reference)",
        });
      }
    }

    try {
      const updatedCategory = await this.client.category.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          parentId: data.parentId,
        },
        include: {
          parent: true,
          _count: {
            select: {
              quizzes: true,
              children: true,
            },
          },
        },
      });

      return this.mapToCategory(updatedCategory);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError({ message: "Category name must be unique" });
      }
      throw error;
    }
  }

  async delete(id: string): Promise<ICategory> {
    const existingCategory = await this.client.category.findUnique({
      where: { id },
      include: {
        parent: true,
        _count: {
          select: {
            quizzes: true,
            children: true,
          },
        },
      },
    });

    if (!existingCategory) {
      throw new EntityNotFoundError({ message: "Category not found" });
    }

    if (existingCategory._count.quizzes > 0) {
      throw new BadRequestError({
        message: "Cannot delete category with associated quizzes",
      });
    }

    if (existingCategory._count.children > 0) {
      throw new BadRequestError({
        message: "Cannot delete category with subcategories",
      });
    }

    await this.client.category.delete({
      where: { id },
    });

    return this.mapToCategory(existingCategory);
  }

  private async isDescendant(
    potentialDescendant: string,
    ancestor: string,
  ): Promise<boolean> {
    const category = await this.client.category.findUnique({
      where: { id: potentialDescendant },
      select: { parentId: true },
    });

    if (!category || !category.parentId) {
      return false;
    }

    if (category.parentId === ancestor) {
      return true;
    }

    return this.isDescendant(category.parentId, ancestor);
  }

  async getHierarchy(): Promise<ICategory[]> {
    const rootCategories = await this.client.category.findMany({
      where: { parentId: null },
      include: {
        parent: true,
        _count: {
          select: {
            quizzes: true,
            children: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return rootCategories.map((category) => this.mapToCategory(category));
  }
}
