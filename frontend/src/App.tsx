import { useEffect, useMemo, useState } from "react";

import { api } from "./api";
import { getTelegramUser, prepareTelegram } from "./telegram";
import type { PublicSettings, Topic } from "./types";

type AppStage = "topics" | "question" | "done";

export default function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<AppStage>("topics");

  useEffect(() => {
    prepareTelegram();
    const telegramUser = getTelegramUser();

    async function load() {
      try {
        const [topicsData, settingsData] = await Promise.all([
          api.getTopics(),
          api.getSettings(),
          api.registerOpen(telegramUser?.id ? String(telegramUser.id) : null),
        ]);
        setTopics(topicsData);
        setSettings(settingsData);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const currentQuestion = selectedTopic?.questions[questionIndex] ?? null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? "" : "";
  const isLastQuestion = selectedTopic ? questionIndex === selectedTopic.questions.length - 1 : false;

  const titleText = useMemo(() => {
    if (stage === "done") {
      return "Спасибо";
    }
    if (selectedTopic) {
      return selectedTopic.title;
    }
    return settings?.app_title || "10 вопросов";
  }, [selectedTopic, settings?.app_title, stage]);

  useEffect(() => {
    if (settings?.app_title) {
      document.title = settings.app_title;
    }
  }, [settings?.app_title]);

  function resetFlow() {
    setSelectedTopic(null);
    setQuestionIndex(0);
    setAnswers({});
    setStage("topics");
  }

  async function handleSubmit() {
    if (!selectedTopic) return;
    const telegramUser = getTelegramUser();
    const payload = {
      topic_id: selectedTopic.id,
      telegram_id: telegramUser?.id ? String(telegramUser.id) : null,
      username: telegramUser?.username ?? null,
      first_name: telegramUser?.first_name ?? null,
      last_name: telegramUser?.last_name ?? null,
      answers: selectedTopic.questions.map((question) => ({
        question_id: question.id,
        question_text: question.text,
        answer: answers[question.id] ?? "",
      })),
    };

    setSubmitting(true);
    setError(null);
    try {
      await api.submit(payload);
      setStage("done");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="card">
        <p className="kicker">Telegram Mini App</p>
        <h1>{titleText}</h1>

        {loading ? <p className="muted">Загрузка...</p> : null}
        {error ? <div className="error-box">{error}</div> : null}

        {!loading && stage === "topics" ? (
          <div className="stack">
            <p className="muted">
              {settings?.app_description || "Выберите психологическую тему и ответьте на 10 вопросов."}
            </p>
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className="topic-card"
                onClick={() => {
                  setSelectedTopic(topic);
                  setQuestionIndex(0);
                  setStage("question");
                }}
              >
                <strong>{topic.title}</strong>
                <span>{topic.description || "10 вопросов для бережного анализа ситуации"}</span>
              </button>
            ))}
          </div>
        ) : null}

        {!loading && stage === "question" && selectedTopic && currentQuestion ? (
          <div className="stack">
            <div className="progress-row">
              <span>
                Вопрос {questionIndex + 1} из {selectedTopic.questions.length}
              </span>
              <button type="button" className="link-button" onClick={resetFlow}>
                Сменить тему
              </button>
            </div>

            <div className="question-card">
              <p>{currentQuestion.text}</p>
            </div>

            <textarea
              value={currentAnswer}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.id]: event.target.value,
                }))
              }
              rows={7}
              placeholder="Напишите ваш ответ..."
            />

            {!isLastQuestion ? (
              <button
                type="button"
                className="primary-button"
                disabled={!currentAnswer.trim()}
                onClick={() => setQuestionIndex((value) => value + 1)}
              >
                Далее
              </button>
            ) : (
              <button
                type="button"
                className="primary-button"
                disabled={!currentAnswer.trim() || submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? "Отправка..." : "Отправить мои ответы"}
              </button>
            )}
          </div>
        ) : null}

        {!loading && stage === "done" ? (
          <div className="stack">
            <p className="thank-you">{settings?.thank_you_text || "Спасибо. Ваши ответы отправлены."}</p>
            <button type="button" className="primary-button" onClick={resetFlow}>
              Вернуться к темам
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
