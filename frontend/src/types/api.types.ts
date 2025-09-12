export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}