export type StageOneOption = {
  text: string;
  score: number;
  sort_order: number;
};

export type StageOneQuestion = {
  id?: number;
  text: string;
  question_type: "single_choice" | "multi_choice";
  sort_order: number;
  options: StageOneOption[];
};

export type ResultOpenQuestion = {
  text: string;
  sort_order: number;
};

export type ResultRange = {
  id?: number;
  title: string;
  summary: string;
  key_task: string;
  min_score: number;
  max_score: number;
  sort_order: number;
  open_questions: ResultOpenQuestion[];
};

export type FlowSettings = {
  id?: number;
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
  created_at?: string;
  updated_at?: string;
};

export type FlowConfig = {
  settings: FlowSettings;
  stage_one_questions: StageOneQuestion[];
  result_ranges: ResultRange[];
};

export type Submission = {
  id: number;
  telegram_id: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  total_score: number;
  continued_to_stage_two: boolean;
  result_title: string;
  result_summary: string;
  key_task: string;
  stage_one_answers: {
    question_id: number;
    question_text: string;
    question_type: string;
    selected_options: { id: number; text: string; score: number }[];
  }[];
  stage_two_answers: {
    question_id: number;
    question_text: string;
    answer: string;
  }[];
  created_at: string;
  updated_at: string;
};
