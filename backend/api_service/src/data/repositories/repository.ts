interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IQueryParams {
  limit?: number;
  offset?: number;
}

interface IRepository {
  findById(id: string): Promise<IEntity | null>;
  findAll(queryParams?: IQueryParams): Promise<[IEntity[], number]>;
  create(
    entity: Omit<IEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<IEntity>;
}

export interface IUser extends IEntity {
  keycloakId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  totalScore: number;
}

export interface IUserQueryParams extends IQueryParams {}

export interface IUserRepository extends IRepository {
  findByKeycloakId(keycloakId: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  update(id: string, user: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<IUser | null>;
  count(queryParams?: IQueryParams): Promise<number>;
}
