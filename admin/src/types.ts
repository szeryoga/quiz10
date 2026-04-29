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

export type ResultRange = {
  id?: number;
  title: string;
  summary: string;
  key_task: string;
  min_score: number;
  max_score: number;
  sort_order: number;
};

export type FlowSettings = {
  id?: number;
  app_title: string;
  app_description: string;
  brand_eyebrow: string;
  brand_name: string;
  intro_feature_one_title: string;
  intro_feature_one_text: string;
  intro_feature_two_title: string;
  intro_feature_two_text: string;
  intro_feature_three_title: string;
  intro_feature_three_text: string;
  send_message_title: string;
  send_message_text: string;
  sent_message_title: string;
  sent_message_text: string;
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
  created_at: string;
  updated_at: string;
};
