export type Topic = {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  questions: Question[];
};

export type Question = {
  id: number;
  topic_id: number;
  text: string;
  sort_order: number;
};

export type Submission = {
  id: number;
  topic_id: number;
  topic_title: string;
  telegram_id: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  answers: { question_id: number; question_text: string; answer: string }[];
  ai_response: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  id: number;
  admin_email: string | null;
  admin_telegram_chat_id: string | null;
  thank_you_text: string;
  user_daily_open_limit: number;
  global_daily_open_limit: number;
  xai_api_key: string | null;
  xai_model: string;
  created_at: string;
  updated_at: string;
};
