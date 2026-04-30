import { getToken, removeToken } from "./auth";
import type { ApiResponse } from "../types";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const buildHeaders = (hasBody: boolean, extra?: HeadersInit): Headers => {
  const headers = new Headers(extra);
  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = { success: false, message: "Invalid server response" };
  }

  if (response.status === 401) {
    removeToken();
    redirectToLogin();
  }

  if (!response.ok) {
    return {
      success: false,
      message: payload.message || "Request failed",
    };
  }

  return payload;
};

const request = async <T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: buildHeaders(body !== undefined),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return await handleResponse<T>(response);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unable to reach API server";
    throw new Error(`Network error while calling ${url}: ${detail}`);
  }
};

export const get = async <T>(endpoint: string) => request<T>("GET", endpoint);

export const post = async <T>(endpoint: string, body: unknown) =>
  request<T>("POST", endpoint, body);

export const put = async <T>(endpoint: string, body: unknown) =>
  request<T>("PUT", endpoint, body);

export const del = async <T>(endpoint: string) => request<T>("DELETE", endpoint);

export const postFormData = async <T>(endpoint: string, formData: FormData) => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(false),
      body: formData,
    });

    return await handleResponse<T>(response);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unable to reach API server";
    throw new Error(`Network error while calling ${url}: ${detail}`);
  }
};
