import type { PublicFlow } from "./types";

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
  getFlow: () => request<PublicFlow>("/public/flow"),
  registerOpen: (telegramId?: string | null) =>
    request<{ success: boolean; user_daily_remaining: number; global_daily_remaining: number }>(
      "/public/open",
      {
        method: "POST",
        body: JSON.stringify({ telegram_id: telegramId || null }),
      }
    ),
  submit: (payload: {
    telegram_id?: string | null;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    request_help: boolean;
    stage_one_answers: { question_id: number; selected_option_ids: number[] }[];
  }) =>
    request<{ success: boolean; total_score: number; result_title: string; request_help: boolean; sent_to: string }>(
      "/public/submit",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};
