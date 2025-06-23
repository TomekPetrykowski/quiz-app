import EntityNotFoundError from "@/errors/EntityNotFoundError";
import BaseRepository from "./BaseRepository";
import { Prisma } from "@prisma/client";
import { IUser, IUserQueryParams, IUserRepository } from "./repository";

type PrismaUser = Prisma.UserGetPayload<{}>;

export class UserRepository
  extends BaseRepository<PrismaUser>
  implements IUserRepository
{
  private mapToUser(user: PrismaUser): IUser {
    return {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatar: user.avatar || undefined,
      totalScore: user.totalScore || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapToUserWithoutPassword(user: PrismaUser): Omit<IUser, "password"> {
    return {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatar: user.avatar || undefined,
      totalScore: user.totalScore || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByKeycloakId(keycloakId: string): Promise<IUser | null> {
    const user = await this.client.user.findUnique({
      where: { keycloakId },
    });

    if (!user) {
      return null;
    }

    return this.mapToUser(user);
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await this.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new EntityNotFoundError({
        message: `User not found`,
      });
    }

    return this.mapToUser(user);
  }

  async findAll(queryParams?: IUserQueryParams): Promise<[IUser[], number]> {
    const {
      limit = this.defaultLimit,
      offset = this.defaultOffset,
      ...rest
    } = queryParams || {};

    const users = await this.client.user.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      ...rest,
    });

    const total = await this.count(queryParams);
    const mappedUsers = users.map((user) => this.mapToUser(user));

    return [mappedUsers, total];
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.mapToUser(user);
  }

  async findByUsername(username: string): Promise<IUser | null> {
    const user = await this.client.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return this.mapToUser(user);
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<IUser | null> {
    const user = await this.client.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToUser(user);
  }

  async create(
    entity: Omit<IUser, "id" | "createdAt" | "updatedAt" | "totalScore">,
  ): Promise<IUser> {
    const user = await this.client.user.create({
      data: {
        ...entity,
      },
    });

    return this.mapToUser(user);
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser> {
    const existingUser = await this.client.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new EntityNotFoundError({
        message: `User not found`,
      });
    }

    const updatedUser = await this.client.user.update({
      where: { id },
      data: {
        ...userData,
      },
    });

    return this.mapToUser(updatedUser);
  }

  async delete(id: string): Promise<IUser | null> {
    const existingUser = await this.client.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new EntityNotFoundError({
        message: `User not found`,
      });
    }

    const deletedUser = await this.client.user.delete({
      where: { id },
    });

    return this.mapToUser(deletedUser);
  }

  async count(queryParams?: IUserQueryParams): Promise<number> {
    const { limit, offset, ...rest } = queryParams || {};
    const count = await this.client.user.count({
      ...rest,
    });
    return count;
  }

  async findByIdWithoutPassword(
    id: string,
  ): Promise<Omit<IUser, "password"> | null> {
    const user = await this.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new EntityNotFoundError({
        message: `User not found`,
      });
    }

    return this.mapToUserWithoutPassword(user);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.client.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.name);
  }

  async setUserRoles(userId: string, roles: string[]): Promise<void> {
    // Remove all current roles
    await this.client.userRole.deleteMany({ where: { userId } });
    // Find role IDs for given role names
    const roleRecords = await this.client.role.findMany({
      where: { name: { in: roles } },
    });
    // Add new roles
    await this.client.userRole.createMany({
      data: roleRecords.map((role) => ({ userId, roleId: role.id })),
      skipDuplicates: true,
    });
  }
}
