import { useEffect, useState } from "react";

import { api } from "./api";
import { closeTelegramApp, getTelegramUser, prepareTelegram } from "./telegram";
import type { PublicFlow, ResultRange, StageOneQuestion } from "./types";

type AppStage = "intro" | "stage1" | "result" | "send-message" | "sent-message" | "done";

function findResultRange(resultRanges: ResultRange[], totalScore: number) {
  return resultRanges.find((item) => totalScore >= item.min_score && totalScore <= item.max_score) ?? null;
}

export default function App() {
  const [flow, setFlow] = useState<PublicFlow | null>(null);
  const [stage, setStage] = useState<AppStage>("intro");
  const [stageOneIndex, setStageOneIndex] = useState(0);
  const [stageOneAnswers, setStageOneAnswers] = useState<Record<number, number[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    prepareTelegram();
    const telegramUser = getTelegramUser();

    async function load() {
      try {
        const bootstrapData = await api.bootstrap(telegramUser?.id ? String(telegramUser.id) : null);
        setFlow(bootstrapData);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    if (flow?.settings.app_title) {
      document.title = flow.settings.app_title;
    }
  }, [flow?.settings.app_title]);

  const currentStageOneQuestion = flow?.stage_one_questions[stageOneIndex] ?? null;
  const isQuestionStage = stage === "stage1" && !!currentStageOneQuestion;
  const isIntroStage = stage === "intro";

  function getComputedResult() {
    if (!flow) return null;
    const totalScore = flow.stage_one_questions.reduce((sum, question) => {
      const selected = stageOneAnswers[question.id] ?? [];
      const optionScore = question.options
        .filter((option) => selected.includes(option.id))
        .reduce((acc, option) => acc + option.score, 0);
      return sum + optionScore;
    }, 0);
    const resultRange = findResultRange(flow.result_ranges, totalScore);
    return resultRange ? { totalScore, resultRange } : null;
  }

  const computedResult = getComputedResult();

  function resetFlow() {
    setStage("intro");
    setStageOneIndex(0);
    setStageOneAnswers({});
    setError(null);
    setSentTo("");
  }

  function updateSingleChoice(questionId: number, optionId: number) {
    setStageOneAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
  }

  function updateMultiChoice(questionId: number, optionId: number) {
    setStageOneAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const next = current.includes(optionId)
        ? current.filter((item) => item !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }

  function isStageOneAnswerReady(question: StageOneQuestion | null) {
    if (!question) return false;
    return (stageOneAnswers[question.id] ?? []).length > 0;
  }

  function submitFlow() {
    setError(null);
    setSentTo("");
    setStage("done");
  }

  function closeApp() {
    closeTelegramApp();
    if (!window.Telegram?.WebApp?.close) {
      window.close();
    }
  }

  return (
    <main className="app-shell">
      <section className={`card${isIntroStage ? " intro-card" : ""}`}>
        <header className="app-header">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <span />
            </div>
            <div>
              <p className="brand-eyebrow">{flow?.settings.brand_eyebrow || "Щербинина Евгения"}</p>
              <p className="brand-name">{flow?.settings.brand_name || "психолог и арт-терапевт"}</p>
            </div>
          </div>
          <div className="brand-badge" aria-hidden="true">
            ?
          </div>
        </header>

        {loading ? <p className="muted">Загрузка...</p> : null}
        {error ? <div className="error-box">{error}</div> : null}

        {!loading && flow && stage === "intro" ? (
          <div className="stack intro-layout">
            <p className="hero-chip">ТЕСТ • 5 МИНУТ</p>
            <h1>{flow.settings.app_title || "10 вопросов"}</h1>
            <p className="muted intro-text">{flow.settings.app_description}</p>
            <div className="feature-grid" aria-hidden="true">
              <article className="feature-card">
                <div className="feature-icon">✦</div>
                <strong>{flow.settings.intro_feature_one_title}</strong>
                <span>{flow.settings.intro_feature_one_text}</span>
              </article>
              <article className="feature-card">
                <div className="feature-icon">◌</div>
                <strong>{flow.settings.intro_feature_two_title}</strong>
                <span>{flow.settings.intro_feature_two_text}</span>
              </article>
              <article className="feature-card">
                <div className="feature-icon">♡</div>
                <strong>{flow.settings.intro_feature_three_title}</strong>
                <span>{flow.settings.intro_feature_three_text}</span>
              </article>
            </div>
            <button type="button" className="primary-button" onClick={() => setStage("stage1")}>
              Начать тест
            </button>
            <p className="footer-note">Примерно 5 минут</p>
          </div>
        ) : null}

        {!loading && flow && stage === "stage1" && currentStageOneQuestion ? (
          <div className="stack question-layout">
            <div className="progress-row">
              <span className="progress-chip">
                Вопрос {stageOneIndex + 1} из {flow.stage_one_questions.length}
              </span>
              <button type="button" className="link-button" onClick={resetFlow}>
                Сначала
              </button>
            </div>
            <div className="progress-bar" aria-hidden="true">
              <span
                style={{ width: `${((stageOneIndex + 1) / flow.stage_one_questions.length) * 100}%` }}
              />
            </div>

            <div className="question-card question-prompt">
              <h1 className="question-title">{currentStageOneQuestion.text}</h1>
            </div>

            <div className="stack option-list" role="group" aria-label={currentStageOneQuestion.text}>
              {currentStageOneQuestion.options.map((option) => {
                const selected = (stageOneAnswers[currentStageOneQuestion.id] ?? []).includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`option-card${selected ? " selected" : ""}`}
                  >
                    <input
                      type={currentStageOneQuestion.question_type === "single_choice" ? "radio" : "checkbox"}
                      name={`question-${currentStageOneQuestion.id}`}
                      checked={selected}
                      onChange={() =>
                        currentStageOneQuestion.question_type === "single_choice"
                          ? updateSingleChoice(currentStageOneQuestion.id, option.id)
                          : updateMultiChoice(currentStageOneQuestion.id, option.id)
                      }
                    />
                    <span className="option-copy">{option.text}</span>
                  </label>
                );
              })}
            </div>
            {stageOneIndex < flow.stage_one_questions.length - 1 ? (
              <button
                type="button"
                className="primary-button"
                disabled={!isStageOneAnswerReady(currentStageOneQuestion)}
                onClick={() => setStageOneIndex((value) => value + 1)}
              >
                Далее
              </button>
            ) : (
              <button
                type="button"
                className="primary-button"
                disabled={!isStageOneAnswerReady(currentStageOneQuestion)}
                onClick={() => setStage("result")}
              >
                Показать результат
              </button>
            )}
          </div>
        ) : null}

        {!loading && flow && stage === "result" && computedResult ? (
          <div className="stack response-layout">
            <div className="question-card response-card">
              <p className="result-title result-main-title">{computedResult.resultRange.title}</p>
              <p className="muted result-summary">{computedResult.resultRange.summary}</p>
            </div>

            <div className="task-card">
              <p>{computedResult.resultRange.key_task}</p>
            </div>

            <div className="button-split">
              <button
                type="button"
                className="primary-button"
                disabled={submitting}
                onClick={() => setStage("send-message")}
              >
                Да
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={submitting}
                onClick={() => setStage("done")}
              >
                Нет
              </button>
            </div>
          </div>
        ) : null}

        {!loading && flow && stage === "send-message" ? (
          <div className="stack response-layout">
            <p className="eyebrow">Следующий шаг</p>
            <p className="result-title">{flow.settings.send_message_title}</p>
            <p className="thank-you">{flow.settings.send_message_text}</p>
            <div className="button-split">
              <button
                type="button"
                className="primary-button"
                disabled={submitting}
                onClick={submitFlow}
              >
                Да
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={submitting}
                onClick={() => setStage("done")}
              >
                Нет
              </button>
            </div>
          </div>
        ) : null}

        {!loading && flow && stage === "sent-message" ? (
          <div className="stack response-layout">
            <p className="eyebrow">Готово</p>
            <p className="result-title">{flow.settings.sent_message_title}</p>
            <p className="sent-meta">сообщение послано {sentTo}</p>
            <p className="thank-you">{flow.settings.sent_message_text}</p>
            <button type="button" className="primary-button" onClick={() => setStage("done")}>
              ОК
            </button>
          </div>
        ) : null}

        {!loading && flow && stage === "done" ? (
          <div className="stack response-layout">
            <p className="eyebrow">Спасибо</p>
            <p className="result-title">{flow.settings.final_title}</p>
            <p className="thank-you">{flow.settings.thank_you_text}</p>
            <button type="button" className="primary-button" onClick={closeApp}>
              {flow.settings.final_button_text}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
