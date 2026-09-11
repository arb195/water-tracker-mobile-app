export type User = {
  username: string;
  createdAt: string;
  hasPin: boolean;
};

export type DashboardData = {
  success: true;
  username: string;
  count: number;
  goal: number;
  cooldownSeconds: number;
};

export type HistoryPoint = {
  key: string;
  label: string;
  count: number;
};

export type HistoryData = {
  success: true;
  rows: HistoryPoint[];
  total: number;
  average: number;
};

export type LeaderboardRow = {
  userId: string;
  username: string;
  count: number;
  rank: number;
  isCurrent: boolean;
};

export type Extremum = {
  userId: string;
  username: string;
  count: number;
};

export type LeaderboardData = {
  success: true;
  rows: LeaderboardRow[];
  activeUsers: number;
  totalGlasses: number;
  average: number;
  highest: Extremum | null;
  lowest: Extremum | null;
};

export type ApiError = {
  success?: false;
  code?: string;
  message?: string;
  retryAfterSeconds?: number;
  remainingSeconds?: number;
  exists?: boolean;
  hasPin?: boolean;
};
