import { PrismaClient } from "@prisma/client";

export default abstract class BaseRepository<T> {
  protected defaultLimit: number = 10;
  protected defaultOffset: number = 0;
  protected client: PrismaClient;

  constructor(client?: PrismaClient) {
    this.client = client || new PrismaClient();
  }

  getClient(): PrismaClient {
    return this.client;
  }
}

export type Constructor<T = {}> = new (...args: any[]) => T;
