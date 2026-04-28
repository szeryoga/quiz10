import type { PublicSettings, Topic } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        message = body.detail;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getTopics: () => request<Topic[]>("/public/topics"),
  getSettings: () => request<PublicSettings>("/public/settings"),
  registerOpen: (telegramId?: string | null) =>
    request<{ success: boolean; user_daily_remaining: number; global_daily_remaining: number }>(
      "/public/open",
      {
        method: "POST",
        body: JSON.stringify({ telegram_id: telegramId || null }),
      }
    ),
  submit: (payload: {
    topic_id: number;
    telegram_id?: string | null;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    answers: { question_id: number; question_text: string; answer: string }[];
  }) =>
    request<{ success: boolean; status: string }>("/public/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
