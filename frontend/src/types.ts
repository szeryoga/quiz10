export type TelegramUser = {
  id?: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export type StageOneOption = {
  id: number;
  text: string;
  score: number;
  sort_order: number;
};

export type StageOneQuestion = {
  id: number;
  text: string;
  question_type: "single_choice" | "multi_choice";
  sort_order: number;
  options: StageOneOption[];
};

export type ResultOpenQuestion = {
  id: number;
  text: string;
  sort_order: number;
};

export type ResultRange = {
  id: number;
  title: string;
  summary: string;
  key_task: string;
  min_score: number;
  max_score: number;
  sort_order: number;
  open_questions: ResultOpenQuestion[];
};

export type FlowSettings = {
  id: number;
  app_title: string;
  app_description: string;
  final_title: string;
  thank_you_text: string;
  final_button_text: string;
  admin_email: string | null;
  admin_telegram_chat_id: string | null;
  user_daily_open_limit: number;
  global_daily_open_limit: number;
  xai_api_key: string | null;
  xai_model: string;
  created_at: string;
  updated_at: string;
};

export type PublicFlow = {
  settings: FlowSettings;
  stage_one_questions: StageOneQuestion[];
  result_ranges: ResultRange[];
};
