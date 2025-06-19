import { Prisma } from "@prisma/client";
import BaseRepository from "./BaseRepository";
import EntityNotFoundError from "@/errors/EntityNotFoundError";
import { BadRequestError } from "@/errors/BadRequestError";
import { IPaginationParams } from "./shared/PaginationHelper";

type PrismaTag = Prisma.TagGetPayload<{
  include: {
    _count: {
      select: {
        quizTags: true;
      };
    };
  };
}>;

export interface ITag {
  id: string;
  name: string;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  quizCount?: number;
}

export interface ITagQueryParams extends IPaginationParams {
  search?: string;
}

export class TagRepository extends BaseRepository<PrismaTag> {
  private mapToTag(tag: PrismaTag): ITag {
    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      quizCount: tag._count?.quizTags || 0,
    };
  }

  async findById(id: string): Promise<ITag> {
    const tag = await this.client.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quizTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new EntityNotFoundError({
        message: `Tag not found`,
      });
    }

    return this.mapToTag(tag);
  }

  async findAll(queryParams?: ITagQueryParams): Promise<[ITag[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      search,
    } = queryParams || {};

    const where: Prisma.TagWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const tags = await this.client.tag.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            quizTags: true,
          },
        },
      },
    });

    const total = await this.client.tag.count({ where });
    const mappedTags = tags.map((tag) => this.mapToTag(tag));

    return [mappedTags, total];
  }

  async create(
    data: Omit<ITag, "id" | "createdAt" | "updatedAt" | "quizCount">,
  ): Promise<ITag> {
    try {
      const tag = await this.client.tag.create({
        data: {
          name: data.name,
          color: data.color,
        },
        include: {
          _count: {
            select: {
              quizTags: true,
            },
          },
        },
      });

      return this.mapToTag(tag);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError({ message: "Tag name must be unique" });
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<ITag>): Promise<ITag> {
    const existingTag = await this.client.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new EntityNotFoundError({ message: "Tag not found" });
    }

    try {
      const updatedTag = await this.client.tag.update({
        where: { id },
        data: {
          name: data.name,
          color: data.color,
        },
        include: {
          _count: {
            select: {
              quizTags: true,
            },
          },
        },
      });

      return this.mapToTag(updatedTag);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError({ message: "Tag name must be unique" });
      }
      throw error;
    }
  }

  async delete(id: string): Promise<ITag> {
    const existingTag = await this.client.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quizTags: true,
          },
        },
      },
    });

    if (!existingTag) {
      throw new EntityNotFoundError({ message: "Tag not found" });
    }

    await this.client.tag.delete({
      where: { id },
    });

    return this.mapToTag(existingTag);
  }

  async getPopularTags(limit = 10): Promise<ITag[]> {
    const tags = await this.client.tag.findMany({
      take: limit,
      orderBy: {
        quizTags: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: {
            quizTags: true,
          },
        },
      },
    });

    return tags.map((tag) => this.mapToTag(tag));
  }
}
