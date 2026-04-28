import { useEffect, useMemo, useState } from "react";

import { api } from "./api";
import { getTelegramUser, prepareTelegram } from "./telegram";
import type { PublicFlow, ResultRange, StageOneQuestion } from "./types";

type AppStage = "intro" | "stage1" | "result" | "stage2" | "done";

function findResultRange(resultRanges: ResultRange[], totalScore: number) {
  return resultRanges.find((item) => totalScore >= item.min_score && totalScore <= item.max_score) ?? null;
}

export default function App() {
  const [flow, setFlow] = useState<PublicFlow | null>(null);
  const [stage, setStage] = useState<AppStage>("intro");
  const [stageOneIndex, setStageOneIndex] = useState(0);
  const [stageTwoIndex, setStageTwoIndex] = useState(0);
  const [stageOneAnswers, setStageOneAnswers] = useState<Record<number, number[]>>({});
  const [stageTwoAnswers, setStageTwoAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    prepareTelegram();
    const telegramUser = getTelegramUser();

    async function load() {
      try {
        const [flowData] = await Promise.all([
          api.getFlow(),
          api.registerOpen(telegramUser?.id ? String(telegramUser.id) : null),
        ]);
        setFlow(flowData);
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
  const currentStageTwoQuestion = useMemo(() => {
    const result = getComputedResult();
    return result?.resultRange.open_questions[stageTwoIndex] ?? null;
  }, [flow, stageOneAnswers, stageTwoIndex]);

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
    setStageTwoIndex(0);
    setStageOneAnswers({});
    setStageTwoAnswers({});
    setError(null);
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

  async function submitFlow(continuedToStageTwo: boolean) {
    if (!flow || !computedResult) return;
    const telegramUser = getTelegramUser();
    setSubmitting(true);
    setError(null);
    try {
      await api.submit({
        telegram_id: telegramUser?.id ? String(telegramUser.id) : null,
        username: telegramUser?.username ?? null,
        first_name: telegramUser?.first_name ?? null,
        last_name: telegramUser?.last_name ?? null,
        continued_to_stage_two: continuedToStageTwo,
        stage_one_answers: flow.stage_one_questions.map((question) => ({
          question_id: question.id,
          selected_option_ids: stageOneAnswers[question.id] ?? [],
        })),
        stage_two_answers: continuedToStageTwo
          ? computedResult.resultRange.open_questions.map((question) => ({
              question_id: question.id,
              answer: stageTwoAnswers[question.id] ?? "",
            }))
          : [],
      });
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
        <h1>{flow?.settings.app_title || "10 вопросов"}</h1>

        {loading ? <p className="muted">Загрузка...</p> : null}
        {error ? <div className="error-box">{error}</div> : null}

        {!loading && flow && stage === "intro" ? (
          <div className="stack">
            <p className="muted">{flow.settings.app_description}</p>
            <button type="button" className="primary-button" onClick={() => setStage("stage1")}>
              Начать
            </button>
          </div>
        ) : null}

        {!loading && flow && stage === "stage1" && currentStageOneQuestion ? (
          <div className="stack">
            <div className="progress-row">
              <span>
                Вопрос {stageOneIndex + 1} из {flow.stage_one_questions.length}
              </span>
              <button type="button" className="link-button" onClick={resetFlow}>
                Сначала
              </button>
            </div>

            <div className="question-card">
              <p>{currentStageOneQuestion.text}</p>
              <small className="helper-text">
                {currentStageOneQuestion.question_type === "multi_choice"
                  ? "Можно выбрать несколько вариантов"
                  : "Выберите один вариант"}
              </small>
            </div>

            <div className="stack">
              {currentStageOneQuestion.options.map((option) => {
                const selected = (stageOneAnswers[currentStageOneQuestion.id] ?? []).includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`option-card${selected ? " selected" : ""}`}
                    onClick={() =>
                      currentStageOneQuestion.question_type === "single_choice"
                        ? updateSingleChoice(currentStageOneQuestion.id, option.id)
                        : updateMultiChoice(currentStageOneQuestion.id, option.id)
                    }
                  >
                    <span>{option.text}</span>
                  </button>
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
          <div className="stack">
            <div className="question-card">
              <p className="result-title">{computedResult.resultRange.title}</p>
              <p className="muted result-summary">{computedResult.resultRange.summary}</p>
            </div>

            <div className="task-card">
              <strong>Ключевая задача</strong>
              <p>{computedResult.resultRange.key_task}</p>
            </div>

            <p className="muted">Хочешь продолжить и ответить ещё на несколько вопросов по этой теме?</p>

            <div className="button-split">
              <button
                type="button"
                className="ghost-button"
                disabled={submitting}
                onClick={() => void submitFlow(false)}
              >
                Нет
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={submitting}
                onClick={() => {
                  setStageTwoIndex(0);
                  setStage("stage2");
                }}
              >
                Да
              </button>
            </div>
          </div>
        ) : null}

        {!loading && flow && stage === "stage2" && computedResult && currentStageTwoQuestion ? (
          <div className="stack">
            <div className="progress-row">
              <span>
                Вопрос {stageTwoIndex + 1} из {computedResult.resultRange.open_questions.length}
              </span>
              <button type="button" className="link-button" onClick={() => setStage("result")}>
                Назад
              </button>
            </div>

            <div className="question-card">
              <p>{currentStageTwoQuestion.text}</p>
            </div>

            <textarea
              value={stageTwoAnswers[currentStageTwoQuestion.id] ?? ""}
              onChange={(event) =>
                setStageTwoAnswers((prev) => ({
                  ...prev,
                  [currentStageTwoQuestion.id]: event.target.value,
                }))
              }
              rows={7}
              placeholder="Напишите ваш ответ..."
            />

            {stageTwoIndex < computedResult.resultRange.open_questions.length - 1 ? (
              <button
                type="button"
                className="primary-button"
                disabled={!(stageTwoAnswers[currentStageTwoQuestion.id] ?? "").trim()}
                onClick={() => setStageTwoIndex((value) => value + 1)}
              >
                Далее
              </button>
            ) : (
              <button
                type="button"
                className="primary-button"
                disabled={!(stageTwoAnswers[currentStageTwoQuestion.id] ?? "").trim() || submitting}
                onClick={() => void submitFlow(true)}
              >
                {submitting ? "Отправка..." : "Отправить ответы"}
              </button>
            )}
          </div>
        ) : null}

        {!loading && flow && stage === "done" ? (
          <div className="stack">
            <p className="thank-you">{flow.settings.thank_you_text}</p>
            <button type="button" className="primary-button" onClick={resetFlow}>
              Пройти заново
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
