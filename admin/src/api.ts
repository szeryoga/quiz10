import type { FlowConfig, Submission } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "quiz10_admin_token";

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

function redirectToLogin() {
  clearToken();
  window.location.href = `${import.meta.env.BASE_URL}login`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    if (response.status === 401 && path !== "/admin/login") {
      redirectToLogin();
      throw new Error("Сессия истекла. Войдите заново.");
    }

    let message = `Request failed: ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (password: string) =>
    request<{ access_token: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  getFlow: () => request<FlowConfig>("/admin/flow"),
  updateFlow: (payload: FlowConfig) =>
    request<FlowConfig>("/admin/flow", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getSubmissions: () => request<Submission[]>("/admin/submissions"),
  getSubmission: (id: number) => request<Submission>(`/admin/submissions/${id}`),
};
