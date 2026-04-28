import type { Question, Settings, Submission, Topic } from "./types";

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
  getSettings: () => request<Settings>("/admin/settings"),
  updateSettings: (payload: Partial<Settings>) =>
    request<Settings>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getTopics: () => request<Topic[]>("/admin/topics"),
  getTopic: (id: number) => request<Topic>(`/admin/topics/${id}`),
  createTopic: (payload: Partial<Topic>) =>
    request<Topic>("/admin/topics", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTopic: (id: number, payload: Partial<Topic>) =>
    request<Topic>(`/admin/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteTopic: (id: number) =>
    request<void>(`/admin/topics/${id}`, {
      method: "DELETE",
    }),
  createQuestion: (payload: Partial<Question>) =>
    request<Question>("/admin/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateQuestion: (id: number, payload: Partial<Question>) =>
    request<Question>(`/admin/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteQuestion: (id: number) =>
    request<void>(`/admin/questions/${id}`, {
      method: "DELETE",
    }),
  getSubmissions: () => request<Submission[]>("/admin/submissions"),
  getSubmission: (id: number) => request<Submission>(`/admin/submissions/${id}`),
};
