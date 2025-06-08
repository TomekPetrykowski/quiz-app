export interface IPaginationParams {
  offset?: number;
  limit?: number;
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class PaginationHelper {
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static buildPaginationResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): IPaginationResult<T> {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
