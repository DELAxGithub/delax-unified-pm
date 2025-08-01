// Program related types
export * from './program';

// Episode related types (with renamed exports to avoid conflicts)
export {
  type EpisodeStatus,
  type EpisodeType,
  type MaterialStatus,
  type EpisodeStatusInfo,
  type Episode,
  type EpisodeDetail,
  type StatusHistory,
  type NewEpisode,
  type UpdateEpisode,
  STATUS_ORDER as EPISODE_STATUS_ORDER,
  STATUS_COLORS as EPISODE_STATUS_COLORS,
  REVERTIBLE_STATUS
} from './episode';

// Calendar task related types
export * from './calendar-task';

// Common utility types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}