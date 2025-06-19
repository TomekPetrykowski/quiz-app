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

type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "OPEN_TEXT"
  | "FILL_BLANK";

export interface IUser extends IEntity {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  totalScore: number;
}

export interface IUserQueryParams extends IQueryParams {}

export interface IUserRepository extends IRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findByEmailOrUsername(emailOrUsername: string): Promise<IUser | null>;
  update(id: string, user: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<IUser | null>;
  count(queryParams?: IQueryParams): Promise<number>;
}
