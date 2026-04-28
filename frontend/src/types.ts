export type TelegramUser = {
  id?: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export type Question = {
  id: number;
  topic_id: number;
  text: string;
  sort_order: number;
};

export type Topic = {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  questions: Question[];
};

export type PublicSettings = {
  app_title: string;
  app_description: string;
  thank_you_text: string;
};
