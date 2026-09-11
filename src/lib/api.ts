import type { ApiError } from "../types";

const rawUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_URL = rawUrl.replace(/\/$/, "");

type RequestOptions = {
  method?: "GET" | "POST";
  token?: string | null;
  body?: unknown;
};

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | ApiError;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  let data: T | ApiError;
  try {
    data = (await response.json()) as T | ApiError;
  } catch {
    data = { success: false, code: "INVALID_RESPONSE", message: "پاسخ سرور قابل خواندن نیست." };
  }

  return { ok: response.ok, status: response.status, data };
}

export function messageFromError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
    return data.message;
  }
  return fallback;
}
