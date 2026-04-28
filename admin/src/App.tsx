import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { api, clearToken, getToken, setToken } from "./api";
import type { Settings, Submission, Topic } from "./types";
import "./styles.css";

function translateSubmissionStatus(status: Submission["status"]) {
  switch (status) {
    case "pending":
      return "В обработке";
    case "analyzed":
      return "Проанализировано";
    case "failed":
      return "Ошибка";
    default:
      return status;
  }
}

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
          <Link to="/topics">Темы</Link>
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
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topics/:id" element={<TopicEditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/submissions" replace />} />
        </Routes>
      </section>
    </div>
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
              <th>Тема</th>
              <th>Статус</th>
              <th>Пользователь</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/submissions/${item.id}`}>{item.id}</Link>
                </td>
                <td>{item.topic_title}</td>
                <td>{translateSubmissionStatus(item.status)}</td>
                <td>{item.username || item.first_name || item.telegram_id || "-"}</td>
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
            <strong>Тема:</strong> {item.topic_title}
            <br />
            <strong>Пользователь:</strong> {item.first_name || "-"} {item.last_name || ""}
            <br />
            <strong>Telegram:</strong> {item.telegram_id || "-"} / {item.username || "-"}
            <br />
            <strong>Статус:</strong> {translateSubmissionStatus(item.status)}
          </div>
          <div className="panel-card">
            <h3>Ответы</h3>
            {item.answers.map((answer, index) => (
              <div key={`${answer.question_id}-${index}`} className="answer-block">
                <strong>{answer.question_text}</strong>
                <p>{answer.answer}</p>
              </div>
            ))}
          </div>
          <div className="panel-card">
            <h3>Анализ ИИ</h3>
            <p className="pre">{item.ai_response || "Нет"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    try {
      setTopics(await api.getTopics());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Ошибка загрузки");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createTopic() {
    const topic = await api.createTopic({
      title: "Новая тема",
      description: "",
      is_active: false,
      sort_order: topics.length + 1,
    });
    navigate(`/topics/${topic.id}`);
  }

  return (
    <div className="page">
      <div className="header-row">
        <h1>Темы</h1>
        <button type="button" onClick={() => void createTopic()}>
          Новая тема
        </button>
      </div>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="stack">
        {topics.map((topic) => (
          <div key={topic.id} className="panel-card clickable" onClick={() => navigate(`/topics/${topic.id}`)}>
            <strong>{topic.title}</strong>
            <span>{topic.is_active ? "Активна" : "Скрыта"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopicEditorPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!params.id) return;
    try {
      setTopic(await api.getTopic(Number(params.id)));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Ошибка загрузки");
    }
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function saveTopic() {
    if (!topic) return;
    await api.updateTopic(topic.id, {
      title: topic.title,
      description: topic.description,
      is_active: topic.is_active,
      sort_order: topic.sort_order,
    });
    await load();
  }

  async function addQuestion() {
    if (!topic) return;
    await api.createQuestion({
      topic_id: topic.id,
      text: "Новый вопрос",
      sort_order: topic.questions.length + 1,
    });
    await load();
  }

  async function saveQuestion(questionId: number, text: string, sortOrder: number) {
    await api.updateQuestion(questionId, { text, sort_order: sortOrder });
    await load();
  }

  async function removeQuestion(questionId: number) {
    await api.deleteQuestion(questionId);
    await load();
  }

  async function removeTopic() {
    if (!topic) return;
    await api.deleteTopic(topic.id);
    navigate("/topics");
  }

  return (
    <div className="page">
      <div className="header-row">
        <h1>Редактор темы</h1>
        <button type="button" className="danger-button" onClick={() => void removeTopic()}>
          Удалить тему
        </button>
      </div>
      {error ? <div className="error-box">{error}</div> : null}
      {topic ? (
        <div className="stack">
          <div className="panel-card form-grid">
            <label>
              Название
              <input value={topic.title} onChange={(e) => setTopic({ ...topic, title: e.target.value })} />
            </label>
            <label>
              Описание
              <textarea
                rows={4}
                value={topic.description || ""}
                onChange={(e) => setTopic({ ...topic, description: e.target.value })}
              />
            </label>
            <label>
              Порядок сортировки
              <input
                type="number"
                value={topic.sort_order}
                onChange={(e) => setTopic({ ...topic, sort_order: Number(e.target.value) })}
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={topic.is_active}
                onChange={(e) => setTopic({ ...topic, is_active: e.target.checked })}
              />
              Показывать на первом экране
            </label>
            <button type="button" onClick={() => void saveTopic()}>
              Сохранить тему
            </button>
          </div>

          <div className="header-row">
            <h2>Вопросы</h2>
            <button type="button" onClick={() => void addQuestion()}>
              Добавить вопрос
            </button>
          </div>

          {topic.questions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              onSave={saveQuestion}
              onDelete={removeQuestion}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function QuestionEditor({
  question,
  onSave,
  onDelete,
}: {
  question: Topic["questions"][number];
  onSave: (id: number, text: string, sortOrder: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [text, setText] = useState(question.text);
  const [sortOrder, setSortOrder] = useState(question.sort_order);

  return (
    <div className="panel-card form-grid">
      <label>
        Вопрос
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <label>
        Порядок сортировки
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
      </label>
      <div className="button-row">
        <button type="button" onClick={() => void onSave(question.id, text, sortOrder)}>
          Сохранить
        </button>
        <button type="button" className="danger-button" onClick={() => void onDelete(question.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch((err: Error) => setError(err.message));
  }, []);

  async function save() {
    if (!settings) return;
    try {
      const next = await api.updateSettings({
        app_title: settings.app_title,
        app_description: settings.app_description,
        admin_email: settings.admin_email,
        admin_telegram_chat_id: settings.admin_telegram_chat_id,
        thank_you_text: settings.thank_you_text,
        user_daily_open_limit: settings.user_daily_open_limit,
        global_daily_open_limit: settings.global_daily_open_limit,
        xai_api_key: settings.xai_api_key,
        xai_model: settings.xai_model,
      });
      setSettings(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Ошибка сохранения");
    }
  }

  return (
    <div className="page">
      <h1>Настройки</h1>
      {error ? <div className="error-box">{error}</div> : null}
      {saved ? <div className="success-box">Сохранено</div> : null}
      {settings ? (
        <div className="panel-card form-grid">
          <label>
            Заголовок приложения
            <input
              value={settings.app_title}
              onChange={(e) => setSettings({ ...settings, app_title: e.target.value })}
            />
          </label>
          <label>
            Описание на первом экране
            <textarea
              rows={3}
              value={settings.app_description}
              onChange={(e) => setSettings({ ...settings, app_description: e.target.value })}
            />
          </label>
          <label>
            Email администратора
            <input
              value={settings.admin_email || ""}
              onChange={(e) => setSettings({ ...settings, admin_email: e.target.value || null })}
            />
          </label>
          <label>
            Telegram chat ID администратора
            <input
              value={settings.admin_telegram_chat_id || ""}
              onChange={(e) => setSettings({ ...settings, admin_telegram_chat_id: e.target.value || null })}
            />
          </label>
          <label>
            Текст после отправки
            <textarea
              rows={5}
              value={settings.thank_you_text}
              onChange={(e) => setSettings({ ...settings, thank_you_text: e.target.value })}
            />
          </label>
          <label>
            Лимит открытий на пользователя в день
            <input
              type="number"
              value={settings.user_daily_open_limit}
              onChange={(e) =>
                setSettings({ ...settings, user_daily_open_limit: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Глобальный лимит открытий в день
            <input
              type="number"
              value={settings.global_daily_open_limit}
              onChange={(e) =>
                setSettings({ ...settings, global_daily_open_limit: Number(e.target.value) })
              }
            />
          </label>
          <label>
            xAI API key
            <input
              value={settings.xai_api_key || ""}
              onChange={(e) => setSettings({ ...settings, xai_api_key: e.target.value || null })}
            />
          </label>
          <label>
            Модель xAI
            <input
              value={settings.xai_model}
              onChange={(e) => setSettings({ ...settings, xai_model: e.target.value })}
            />
          </label>
          <button type="button" onClick={() => void save()}>
            Сохранить настройки
          </button>
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
