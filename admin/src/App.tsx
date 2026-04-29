import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { api, clearToken, getToken, setToken } from "./api";
import type { FlowConfig, ResultRange, StageOneQuestion, Submission } from "./types";
import "./styles.css";

function LoginPage() {
  const [password, setPasswordValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await api.login(password);
      setToken(response.access_token);
      navigate("/submissions");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Ошибка входа");
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Админка Quiz10</h1>
        <input
          type="password"
          value={password}
          onChange={(event) => setPasswordValue(event.target.value)}
          placeholder="Пароль администратора"
        />
        {error ? <div className="error-box">{error}</div> : null}
        <button type="submit">Войти</button>
      </form>
    </main>
  );
}

function useFlowEditorData() {
  const [flow, setFlow] = useState<FlowConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getFlow().then(setFlow).catch((err: Error) => setError(err.message));
  }, []);

  async function save(nextFlow?: FlowConfig) {
    const payload = nextFlow ?? flow;
    if (!payload) return;
    try {
      const next = await api.updateFlow(payload);
      setFlow(next);
      setSaved(true);
      setError(null);
      window.setTimeout(() => setSaved(false), 1500);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Ошибка сохранения");
    }
  }

  return { flow, setFlow, error, setError, saved, save };
}

function ProtectedLayout() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Quiz10</h2>
        <nav>
          <Link to="/submissions">Ответы</Link>
          <Link to="/intro">Первая страница</Link>
          <Link to="/stage1">Вопросы</Link>
          <Link to="/results">Выводы</Link>
          <Link to="/send-message">Посылка сообщения</Link>
          <Link to="/sent-message">Сообщение послано</Link>
          <Link to="/final">Последняя страница</Link>
          <Link to="/settings">Настройки</Link>
        </nav>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            clearToken();
            window.location.href = `${import.meta.env.BASE_URL}login`;
          }}
        >
          Выйти
        </button>
      </aside>
      <section className="content">
        <Routes>
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="/submissions/:id" element={<SubmissionDetailsPage />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/stage1" element={<StageOnePage />} />
          <Route path="/results" element={<ResultRangesPage />} />
          <Route path="/send-message" element={<SendMessagePage />} />
          <Route path="/sent-message" element={<SentMessagePage />} />
          <Route path="/final" element={<FinalPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/submissions" replace />} />
        </Routes>
      </section>
    </div>
  );
}

function SaveHeader({ title, onSave }: { title: string; onSave: () => Promise<void> | void }) {
  return (
    <div className="header-row">
      <h1>{title}</h1>
      <button type="button" onClick={() => void onSave()}>
        Сохранить
      </button>
    </div>
  );
}

function StatusBanners({ error, saved }: { error: string | null; saved: boolean }) {
  return (
    <>
      {error ? <div className="error-box">{error}</div> : null}
      {saved ? <div className="success-box">Сохранено</div> : null}
    </>
  );
}

function SubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSubmissions().then(setItems).catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Ответы пользователей</h1>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Результат</th>
              <th>Баллы</th>
              <th>Пользователь</th>
              <th>Запросил помощь</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/submissions/${item.id}`}>{item.id}</Link>
                </td>
                <td>{item.result_title}</td>
                <td>{item.total_score}</td>
                <td>{item.username || item.first_name || item.telegram_id || "-"}</td>
                <td>{item.continued_to_stage_two ? "Да" : "Нет"}</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubmissionDetailsPage() {
  const params = useParams();
  const [item, setItem] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api.getSubmission(Number(params.id)).then(setItem).catch((err: Error) => setError(err.message));
  }, [params.id]);

  return (
    <div className="page">
      <h1>Ответ #{params.id}</h1>
      {error ? <div className="error-box">{error}</div> : null}
      {item ? (
        <div className="stack">
          <div className="panel-card">
            <strong>Результат:</strong> {item.result_title}
            <br />
            <strong>Баллы:</strong> {item.total_score}
            <br />
            <strong>Запросил помощь:</strong> {item.continued_to_stage_two ? "Да" : "Нет"}
            <br />
            <strong>Пользователь:</strong> {item.first_name || "-"} {item.last_name || ""}
            <br />
            <strong>Telegram:</strong> {item.telegram_id || "-"} / {item.username || "-"}
          </div>

          <div className="panel-card">
            <h3>Вывод</h3>
            <p className="pre">{item.result_summary}</p>
            <h3>Ключевая задача</h3>
            <p className="pre">{item.key_task}</p>
          </div>

          <div className="panel-card">
            <h3>Этап 1</h3>
            {item.stage_one_answers.map((answer, index) => (
              <div key={`${answer.question_id}-${index}`} className="answer-block">
                <strong>{answer.question_text}</strong>
                <p>{answer.selected_options.map((option) => `${option.text} (${option.score})`).join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IntroPage() {
  const { flow, setFlow, error, saved, save } = useFlowEditorData();

  return (
    <div className="page">
      <SaveHeader title="Первая страница" onSave={save} />
      <StatusBanners error={error} saved={saved} />
      {flow ? (
        <div className="panel-card form-grid">
          <label>
            Заголовок
            <input
              value={flow.settings.app_title}
              onChange={(e) => setFlow({ ...flow, settings: { ...flow.settings, app_title: e.target.value } })}
            />
          </label>
          <label>
            Текст
            <textarea
              rows={4}
              value={flow.settings.app_description}
              onChange={(e) => setFlow({ ...flow, settings: { ...flow.settings, app_description: e.target.value } })}
            />
          </label>
          <label>
            Верхняя строка бренда
            <input
              value={flow.settings.brand_eyebrow}
              onChange={(e) => setFlow({ ...flow, settings: { ...flow.settings, brand_eyebrow: e.target.value } })}
            />
          </label>
          <label>
            Нижняя строка бренда
            <input
              value={flow.settings.brand_name}
              onChange={(e) => setFlow({ ...flow, settings: { ...flow.settings, brand_name: e.target.value } })}
            />
          </label>
          <label>
            Блок 1: заголовок
            <input
              value={flow.settings.intro_feature_one_title}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, intro_feature_one_title: e.target.value } })
              }
            />
          </label>
          <label>
            Блок 1: текст
            <textarea
              rows={3}
              value={flow.settings.intro_feature_one_text}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, intro_feature_one_text: e.target.value } })
              }
            />
          </label>
          <label>
            Блок 2: заголовок
            <input
              value={flow.settings.intro_feature_two_title}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, intro_feature_two_title: e.target.value } })
              }
            />
          </label>
          <label>
            Блок 2: текст
            <textarea
              rows={3}
              value={flow.settings.intro_feature_two_text}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, intro_feature_two_text: e.target.value } })
              }
            />
          </label>
          <label>
            Блок 3: заголовок
            <input
              value={flow.settings.intro_feature_three_title}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, intro_feature_three_title: e.target.value } })
              }
            />
          </label>
          <label>
            Блок 3: текст
            <textarea
              rows={3}
              value={flow.settings.intro_feature_three_text}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, intro_feature_three_text: e.target.value } })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function StageOnePage() {
  const { flow, setFlow, error, saved, save } = useFlowEditorData();

  function updateQuestion(index: number, updater: (question: StageOneQuestion) => StageOneQuestion) {
    if (!flow) return;
    setFlow({
      ...flow,
      stage_one_questions: flow.stage_one_questions.map((question, questionIndex) =>
        questionIndex === index ? updater(question) : question
      ),
    });
  }

  return (
    <div className="page">
      <SaveHeader title="Вопросы" onSave={save} />
      <StatusBanners error={error} saved={saved} />
      {flow ? (
        <div className="panel-card form-grid">
          <div className="header-row">
            <h2>Вопросы</h2>
            <button
              type="button"
              onClick={() =>
                setFlow({
                  ...flow,
                  stage_one_questions: [
                    ...flow.stage_one_questions,
                    {
                      text: "Новый вопрос",
                      question_type: "single_choice",
                      sort_order: flow.stage_one_questions.length + 1,
                      options: [{ text: "Новый вариант", score: 0, sort_order: 1 }],
                    },
                  ],
                })
              }
            >
              Добавить вопрос
            </button>
          </div>

          {flow.stage_one_questions.map((question, questionIndex) => (
            <div key={questionIndex} className="nested-card">
              <div className="header-row">
                <strong>Вопрос {questionIndex + 1}</strong>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() =>
                    setFlow({
                      ...flow,
                      stage_one_questions: flow.stage_one_questions.filter((_, index) => index !== questionIndex),
                    })
                  }
                >
                  Удалить
                </button>
              </div>
              <div className="form-grid">
                <label>
                  Текст вопроса
                  <textarea
                    rows={3}
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, (current) => ({ ...current, text: e.target.value }))}
                  />
                </label>
                <label>
                  Тип вопроса
                  <select
                    value={question.question_type}
                    onChange={(e) =>
                      updateQuestion(questionIndex, (current) => ({
                        ...current,
                        question_type: e.target.value as StageOneQuestion["question_type"],
                      }))
                    }
                  >
                    <option value="single_choice">Один вариант</option>
                    <option value="multi_choice">Несколько вариантов</option>
                  </select>
                </label>
                <label>
                  Порядок сортировки
                  <input
                    type="number"
                    value={question.sort_order}
                    onChange={(e) =>
                      updateQuestion(questionIndex, (current) => ({ ...current, sort_order: Number(e.target.value) }))
                    }
                  />
                </label>

                <div className="stack">
                  <div className="header-row">
                    <strong>Варианты ответов</strong>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(questionIndex, (current) => ({
                          ...current,
                          options: [
                            ...current.options,
                            { text: "Новый вариант", score: 0, sort_order: current.options.length + 1 },
                          ],
                        }))
                      }
                    >
                      Добавить вариант
                    </button>
                  </div>

                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="inline-grid">
                      <input
                        value={option.text}
                        onChange={(e) =>
                          updateQuestion(questionIndex, (current) => ({
                            ...current,
                            options: current.options.map((item, itemIndex) =>
                              itemIndex === optionIndex ? { ...item, text: e.target.value } : item
                            ),
                          }))
                        }
                      />
                      <input
                        type="number"
                        value={option.score}
                        onChange={(e) =>
                          updateQuestion(questionIndex, (current) => ({
                            ...current,
                            options: current.options.map((item, itemIndex) =>
                              itemIndex === optionIndex ? { ...item, score: Number(e.target.value) } : item
                            ),
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          updateQuestion(questionIndex, (current) => ({
                            ...current,
                            options: current.options.filter((_, itemIndex) => itemIndex !== optionIndex),
                          }))
                        }
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ResultRangesPage() {
  const { flow, setFlow, error, saved, save } = useFlowEditorData();

  function updateRange(index: number, updater: (range: ResultRange) => ResultRange) {
    if (!flow) return;
    setFlow({
      ...flow,
      result_ranges: flow.result_ranges.map((range, rangeIndex) => (rangeIndex === index ? updater(range) : range)),
    });
  }

  return (
    <div className="page">
      <SaveHeader title="Выводы" onSave={save} />
      <StatusBanners error={error} saved={saved} />
      {flow ? (
        <div className="panel-card form-grid">
          <div className="header-row">
            <h2>Диапазоны</h2>
            <button
              type="button"
              onClick={() =>
                setFlow({
                  ...flow,
                  result_ranges: [
                    ...flow.result_ranges,
                    {
                      title: "Новый диапазон",
                      summary: "Описание вывода",
                      key_task: "Ключевая задача",
                      min_score: 0,
                      max_score: 0,
                      sort_order: flow.result_ranges.length + 1,
                    },
                  ],
                })
              }
            >
              Добавить диапазон
            </button>
          </div>

          {flow.result_ranges.map((range, rangeIndex) => (
            <div key={rangeIndex} className="nested-card">
              <div className="header-row">
                <strong>Диапазон {rangeIndex + 1}</strong>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() =>
                    setFlow({
                      ...flow,
                      result_ranges: flow.result_ranges.filter((_, index) => index !== rangeIndex),
                    })
                  }
                >
                  Удалить
                </button>
              </div>
              <div className="form-grid">
                <label>
                  Заголовок вывода
                  <input
                    value={range.title}
                    onChange={(e) => updateRange(rangeIndex, (current) => ({ ...current, title: e.target.value }))}
                  />
                </label>
                <label>
                  Текст вывода
                  <textarea
                    rows={4}
                    value={range.summary}
                    onChange={(e) => updateRange(rangeIndex, (current) => ({ ...current, summary: e.target.value }))}
                  />
                </label>
                <label>
                  Ключевая задача
                  <textarea
                    rows={3}
                    value={range.key_task}
                    onChange={(e) => updateRange(rangeIndex, (current) => ({ ...current, key_task: e.target.value }))}
                  />
                </label>
                <div className="inline-grid">
                  <input
                    type="number"
                    value={range.min_score}
                    onChange={(e) =>
                      updateRange(rangeIndex, (current) => ({ ...current, min_score: Number(e.target.value) }))
                    }
                  />
                  <input
                    type="number"
                    value={range.max_score}
                    onChange={(e) =>
                      updateRange(rangeIndex, (current) => ({ ...current, max_score: Number(e.target.value) }))
                    }
                  />
                  <input
                    type="number"
                    value={range.sort_order}
                    onChange={(e) =>
                      updateRange(rangeIndex, (current) => ({ ...current, sort_order: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FinalPage() {
  const { flow, setFlow, error, saved, save } = useFlowEditorData();

  return (
    <div className="page">
      <SaveHeader title="Последняя страница" onSave={save} />
      <StatusBanners error={error} saved={saved} />
      {flow ? (
        <div className="panel-card form-grid">
          <label>
            Заголовок
            <input
              value={flow.settings.final_title}
              onChange={(e) => setFlow({ ...flow, settings: { ...flow.settings, final_title: e.target.value } })}
            />
          </label>
          <label>
            Текст
            <textarea
              rows={4}
              value={flow.settings.thank_you_text}
              onChange={(e) => setFlow({ ...flow, settings: { ...flow.settings, thank_you_text: e.target.value } })}
            />
          </label>
          <label>
            Надпись на кнопке
            <input
              value={flow.settings.final_button_text}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, final_button_text: e.target.value } })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function SendMessagePage() {
  const { flow, setFlow, error, saved, save } = useFlowEditorData();

  return (
    <div className="page">
      <SaveHeader title="Посылка сообщения" onSave={save} />
      <StatusBanners error={error} saved={saved} />
      {flow ? (
        <div className="panel-card form-grid">
          <label>
            Заголовок
            <input
              value={flow.settings.send_message_title}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, send_message_title: e.target.value } })
              }
            />
          </label>
          <label>
            Текст
            <textarea
              rows={4}
              value={flow.settings.send_message_text}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, send_message_text: e.target.value } })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function SentMessagePage() {
  const { flow, setFlow, error, saved, save } = useFlowEditorData();

  return (
    <div className="page">
      <SaveHeader title="Сообщение послано" onSave={save} />
      <StatusBanners error={error} saved={saved} />
      {flow ? (
        <div className="panel-card form-grid">
          <label>
            Заголовок
            <input
              value={flow.settings.sent_message_title}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, sent_message_title: e.target.value } })
              }
            />
          </label>
          <label>
            Текст
            <textarea
              rows={4}
              value={flow.settings.sent_message_text}
              onChange={(e) =>
                setFlow({ ...flow, settings: { ...flow.settings, sent_message_text: e.target.value } })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function SettingsPage() {
  const { flow, setFlow, error, saved, save } = useFlowEditorData();

  return (
    <div className="page">
      <SaveHeader title="Настройки" onSave={save} />
      <StatusBanners error={error} saved={saved} />
      {flow ? (
        <div className="panel-card form-grid">
          <label>
            Telegram администратора
            <input
              value={flow.settings.admin_telegram_chat_id || ""}
              onChange={(e) =>
                setFlow({
                  ...flow,
                  settings: { ...flow.settings, admin_telegram_chat_id: e.target.value || null },
                })
              }
            />
          </label>
          <label>
            Лимит открытий на одного пользователя в сутки
            <input
              type="number"
              value={flow.settings.user_daily_open_limit}
              onChange={(e) =>
                setFlow({
                  ...flow,
                  settings: { ...flow.settings, user_daily_open_limit: Number(e.target.value) },
                })
              }
            />
          </label>
          <label>
            Глобальный лимит открытий в сутки
            <input
              type="number"
              value={flow.settings.global_daily_open_limit}
              onChange={(e) =>
                setFlow({
                  ...flow,
                  settings: { ...flow.settings, global_daily_open_limit: Number(e.target.value) },
                })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
