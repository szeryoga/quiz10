--
-- PostgreSQL database dump
--

\restrict BSFj0x0DCVGXdVLRb4V0hsP0MiWQDmlfrU0bAb2YlwdV3S4eq38ETazqu8kisrk

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_open_events; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.app_open_events (
    id integer NOT NULL,
    telegram_id character varying(64),
    ip_address character varying(64),
    user_agent character varying(512),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_open_events OWNER TO quiz10;

--
-- Name: app_open_events_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.app_open_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_open_events_id_seq OWNER TO quiz10;

--
-- Name: app_open_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.app_open_events_id_seq OWNED BY public.app_open_events.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    app_title character varying(255) NOT NULL,
    app_description text NOT NULL,
    final_title character varying(255) NOT NULL,
    admin_email character varying(255),
    admin_telegram_chat_id character varying(64),
    thank_you_text text NOT NULL,
    final_button_text character varying(255) NOT NULL,
    user_daily_open_limit integer NOT NULL,
    global_daily_open_limit integer NOT NULL,
    xai_api_key text,
    xai_model character varying(120) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    send_message_title character varying(255) DEFAULT 'Посылка сообщения'::character varying,
    send_message_text text DEFAULT 'Отправь мне результаты твоего теста, я посмотрю их и свяжусь с тобой'::text,
    sent_message_title character varying(255) DEFAULT 'Сообщение послано'::character varying,
    sent_message_text text DEFAULT 'Спасибо! Я получила твои ответы, скоро свяжусь с тобой'::text
);


ALTER TABLE public.app_settings OWNER TO quiz10;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    topic_id integer NOT NULL,
    text text NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.questions OWNER TO quiz10;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO quiz10;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: result_open_questions; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.result_open_questions (
    id integer NOT NULL,
    result_range_id integer NOT NULL,
    text text NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.result_open_questions OWNER TO quiz10;

--
-- Name: result_open_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.result_open_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.result_open_questions_id_seq OWNER TO quiz10;

--
-- Name: result_open_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.result_open_questions_id_seq OWNED BY public.result_open_questions.id;


--
-- Name: result_ranges; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.result_ranges (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    summary text NOT NULL,
    key_task text NOT NULL,
    min_score integer NOT NULL,
    max_score integer NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.result_ranges OWNER TO quiz10;

--
-- Name: result_ranges_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.result_ranges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.result_ranges_id_seq OWNER TO quiz10;

--
-- Name: result_ranges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.result_ranges_id_seq OWNED BY public.result_ranges.id;


--
-- Name: stage_one_options; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.stage_one_options (
    id integer NOT NULL,
    question_id integer NOT NULL,
    text text NOT NULL,
    score integer NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stage_one_options OWNER TO quiz10;

--
-- Name: stage_one_options_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.stage_one_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stage_one_options_id_seq OWNER TO quiz10;

--
-- Name: stage_one_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.stage_one_options_id_seq OWNED BY public.stage_one_options.id;


--
-- Name: stage_one_questions; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.stage_one_questions (
    id integer NOT NULL,
    text text NOT NULL,
    question_type character varying(32) NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stage_one_questions OWNER TO quiz10;

--
-- Name: stage_one_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.stage_one_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stage_one_questions_id_seq OWNER TO quiz10;

--
-- Name: stage_one_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.stage_one_questions_id_seq OWNED BY public.stage_one_questions.id;


--
-- Name: survey_submissions; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.survey_submissions (
    id integer NOT NULL,
    telegram_id character varying(64),
    username character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    total_score integer NOT NULL,
    continued_to_stage_two boolean NOT NULL,
    result_range_id integer,
    result_title character varying(255) NOT NULL,
    result_summary text NOT NULL,
    key_task text NOT NULL,
    stage_one_answers jsonb NOT NULL,
    stage_two_answers jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.survey_submissions OWNER TO quiz10;

--
-- Name: survey_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.survey_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_submissions_id_seq OWNER TO quiz10;

--
-- Name: survey_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.survey_submissions_id_seq OWNED BY public.survey_submissions.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    is_active boolean NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.topics OWNER TO quiz10;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_id_seq OWNER TO quiz10;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: user_submissions; Type: TABLE; Schema: public; Owner: quiz10
--

CREATE TABLE public.user_submissions (
    id integer NOT NULL,
    topic_id integer NOT NULL,
    telegram_id character varying(64),
    username character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    answers jsonb NOT NULL,
    ai_response text,
    status character varying(8) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_submissions OWNER TO quiz10;

--
-- Name: user_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: quiz10
--

CREATE SEQUENCE public.user_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_submissions_id_seq OWNER TO quiz10;

--
-- Name: user_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiz10
--

ALTER SEQUENCE public.user_submissions_id_seq OWNED BY public.user_submissions.id;


--
-- Name: app_open_events id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.app_open_events ALTER COLUMN id SET DEFAULT nextval('public.app_open_events_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: result_open_questions id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.result_open_questions ALTER COLUMN id SET DEFAULT nextval('public.result_open_questions_id_seq'::regclass);


--
-- Name: result_ranges id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.result_ranges ALTER COLUMN id SET DEFAULT nextval('public.result_ranges_id_seq'::regclass);


--
-- Name: stage_one_options id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.stage_one_options ALTER COLUMN id SET DEFAULT nextval('public.stage_one_options_id_seq'::regclass);


--
-- Name: stage_one_questions id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.stage_one_questions ALTER COLUMN id SET DEFAULT nextval('public.stage_one_questions_id_seq'::regclass);


--
-- Name: survey_submissions id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.survey_submissions ALTER COLUMN id SET DEFAULT nextval('public.survey_submissions_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: user_submissions id; Type: DEFAULT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.user_submissions ALTER COLUMN id SET DEFAULT nextval('public.user_submissions_id_seq'::regclass);


--
-- Data for Name: app_open_events; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.app_open_events (id, telegram_id, ip_address, user_agent, created_at, updated_at) FROM stdin;
1       \N      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0        2026-04-28 12:41:41.294434+00 2026-04-28 12:41:41.294434+00
2       \N      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0        2026-04-28 12:45:00.41238+00  2026-04-28 12:45:00.41238+00
3       2072593486      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0 2026-04-28 12:56:38.317126+00   2026-04-28 12:56:38.317126+00
4       2072593486      172.19.0.2      Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148       2026-04-28 12:57:19.121714+00   2026-04-28 12:57:19.121714+00
5       2072593486      172.19.0.2      Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148       2026-04-28 12:59:11.94098+00    2026-04-28 12:59:11.94098+00
6       141085230       172.19.0.2      Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148       2026-04-28 13:47:50.771843+00   2026-04-28 13:47:50.771843+00
7       141085230       172.19.0.2      Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148       2026-04-28 13:47:51.453386+00   2026-04-28 13:47:51.453386+00
8       141085230       172.19.0.2      Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148       2026-04-28 13:47:51.49569+00    2026-04-28 13:47:51.49569+00
9       \N      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0        2026-04-28 19:19:26.251788+00 2026-04-28 19:19:26.251788+00
10      \N      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0        2026-04-28 19:19:54.938933+00 2026-04-28 19:19:54.938933+00
11      2072593486      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0 2026-04-28 19:20:05.193658+00   2026-04-28 19:20:05.193658+00
12      2072593486      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0 2026-04-28 19:23:21.919528+00   2026-04-28 19:23:21.919528+00
13      2072593486      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0 2026-04-28 19:44:21.079782+00   2026-04-28 19:44:21.079782+00
14      2072593486      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0 2026-04-28 19:44:39.60734+00    2026-04-28 19:44:39.60734+00
15      2072593486      172.19.0.2      Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0 2026-04-28 19:45:48.855805+00   2026-04-28 19:45:48.855805+00
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.app_settings (id, app_title, app_description, final_title, admin_email, admin_telegram_chat_id, thank_you_text, final_button_text, user_daily_open_limit, global_daily_open_limit, xai_api_key, xai_model, created_at, updated_at, send_message_title, send_message_text, sent_message_title, sent_message_text) FROM stdin;
1       Вопрос дня      Насколько ты сейчас в контакте с собой (и своим состоянием)?    Спасибо за ответы!      \N      2072593486    Ты сделал(а) важный шаг к лучшему пониманию своего состояния.   ОК      100     100     \N      grok-2-latest   2026-04-28 12:41:11.115233+00 2026-04-28 19:50:03.298812+00   Посылка сообщения       Отправь мне результаты твоего теста, я посмотрю их и свяжусь с тобой  Сообщение послано       Спасибо! Я получила твои ответы, скоро свяжусь с тобой
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.questions (id, topic_id, text, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: result_open_questions; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.result_open_questions (id, result_range_id, text, sort_order, created_at, updated_at) FROM stdin;
109     28      Опиши ситуацию за последние 2 дня, когда тебе было неприятно или тревожно. Что именно происходило?      1    2026-04-28 19:50:03.298812+00    2026-04-28 19:50:03.298812+00
110     28      Что ты в этот момент чувствовал(а) в теле (если можешь вспомнить)?      2       2026-04-28 19:50:03.298812+002026-04-28 19:50:03.298812+00
111     28      Что ты сделал(а) в этой ситуации — и помогло ли это?    3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
112     28      Если бы ты мог(ла) остановиться в тот момент, что бы ты попробовал(а) сделать по-другому?       4       2026-04-28 19:50:03.298812+00 2026-04-28 19:50:03.298812+00
113     29      В какой ситуации тебе сложнее всего сохранять контакт с собой? Опиши её.        1       2026-04-28 19:50:03.298812+00 2026-04-28 19:50:03.298812+00
114     29      Что обычно “сбивает” тебя сильнее — мысли, эмоции или реакции других людей?     2       2026-04-28 19:50:03.298812+00 2026-04-28 19:50:03.298812+00
115     29      Есть ли у тебя способ вернуть себе устойчивость? Как ты это делаешь?    3       2026-04-28 19:50:03.298812+002026-04-28 19:50:03.298812+00
116     29      Что мешает тебе делать это чаще?        4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
117     30      В какой ситуации ты в последнее время чувствовал(а) себя максимально “живым(ой)” и в контакте с собой?  1    2026-04-28 19:50:03.298812+00    2026-04-28 19:50:03.298812+00
118     30      Что именно ты делал(а) в этот момент (действия, поведение, состояние)?  2       2026-04-28 19:50:03.298812+002026-04-28 19:50:03.298812+00
119     30      Есть ли сфера, где тебе всё ещё сложно проявляться? Какая?      3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
120     30      Если представить, что ты выражаешь себя свободно — что изменится в твоей жизни? 4       2026-04-28 19:50:03.298812+00 2026-04-28 19:50:03.298812+00
\.


--
-- Data for Name: result_ranges; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.result_ranges (id, title, summary, key_task, min_score, max_score, sort_order, created_at, updated_at) FROM stdin;
28      Ты сейчас в слабом контакте с собой     Ты, скорее всего, либо перегружен(а), либо отрезаешь часть ощущений.\nМного напряжения уходит в голову или игнорируется телом.        Хочешь немного пообщаемся, чтобы вернуть тебе базовый контакт с телом и состоянием?   0       180     1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
29      У тебя частичный контакт с собой        Ты уже замечаешь свои состояния, но не всегда умеешь с ними работать.\nВ стрессе можешь “выпадать” или застревать в мыслях.   Хочешь немного пообщаемся, чтобы научиться переключаться и проживать состояние?       181     350     2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
30      У тебя хороший контакт с собой  Ты умеешь замечать и регулировать состояние,\nно, возможно, не всегда используешь это как ресурс.     Хочешь немного пообщаемся, чтобы углубить контакт и начать выражаться свободнее?        351     500     3    2026-04-28 19:50:03.298812+00    2026-04-28 19:50:03.298812+00
\.


--
-- Data for Name: stage_one_options; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.stage_one_options (id, question_id, text, score, sort_order, created_at, updated_at) FROM stdin;
244     55      Я чётко понимаю, что со мной    100     1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
245     55      Примерно понимаю        70      2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
246     55      Скорее запутан(а)       30      3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
247     55      Вообще не понимаю       0       4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
248     56      В теле (напряжение, дыхание)    100     1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
249     56      В мыслях        60      2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
250     56      В эмоциях       70      3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
251     56      Нигде не ощущаю 10      4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
252     57      Пытаюсь отвлечься       30      1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
253     57      Анализирую      50      2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
254     57      Дышу / замедляюсь       90      3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
255     57      Иду в действие (что-то делаю)   70      4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
256     57      Игнорирую       10      5       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
257     57      Обращаюсь к телу (движение, прикосновения)      100     6       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
258     58      Очень легко     100     1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
259     58      Скорее легко    70      2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
260     58      Скорее сложно   40      3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
261     58      Очень сложно    10      4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
262     59      Импровизирую и подстраиваюсь    100     1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
263     59      Частично адаптируюсь    70      2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
264     59      Теряюсь 30      3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
265     59      Закрываюсь      10      4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
266     60      Мне сложно замедлиться  40      1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
267     60      Я часто “в голове”      30      2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
268     60      Я теряю контакт с телом 20      3       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
269     60      Мне трудно проявляться  30      4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
270     60      Я чувствую себя достаточно устойчиво    100     5       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
\.


--
-- Data for Name: stage_one_questions; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.stage_one_questions (id, text, question_type, sort_order, created_at, updated_at) FROM stdin;
55      Как ты сейчас чувствуешь своё состояние?        single_choice   1       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
56      Где ты больше всего ощущаешь своё состояние?    single_choice   2       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
57      Что ты обычно делаешь, когда становится тревожно/неприятно?     multi_choice    3       2026-04-28 19:50:03.298812+002026-04-28 19:50:03.298812+00
58      Насколько тебе легко выражать себя (эмоции, мысли)?     single_choice   4       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
59      Когда ты в новой или стрессовой ситуации, ты чаще…      single_choice   5       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
60      Что из этого тебе откликается?  multi_choice    6       2026-04-28 19:50:03.298812+00   2026-04-28 19:50:03.298812+00
\.


--
-- Data for Name: survey_submissions; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.survey_submissions (id, telegram_id, username, first_name, last_name, total_score, continued_to_stage_two, result_range_id, result_title, result_summary, key_task, stage_one_answers, stage_two_answers, created_at, updated_at) FROM stdin;
1       2072593486      szeryoga        Sergei  Sadovnikov      340     t       \N      У тебя частичный контакт с собой     Ты уже замечаешь свои состояния, но не всегда умеешь с ними работать.\nВ стрессе можешь “выпадать” или застревать в мыслях.   Хочешь продолжить, чтобы научиться переключаться и проживать состояние?  [{"question_id": 19, "question_text": "Как ты сейчас чувствуешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 83, "text": "Примерно понимаю", "score": 70}]}, {"question_id": 20, "question_text": "Где ты больше всего ощущаешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 89, "text": "Нигде не ощущаю", "score": 10}]}, {"question_id": 21, "question_text": "Что ты обычно делаешь, когда становится тревожно/неприятно?", "question_type": "multi_choice", "selected_options": [{"id": 91, "text": "Анализирую", "score": 50}, {"id": 92, "text": "Дышу / замедляюсь", "score": 90}]}, {"question_id": 22, "question_text": "Насколько тебе легко выражать себя (эмоции, мысли)?", "question_type": "single_choice", "selected_options": [{"id": 98, "text": "Скорее сложно", "score": 40}]}, {"question_id": 23, "question_text": "Когда ты в новой или стрессовой ситуации, ты чаще…", "question_type": "single_choice", "selected_options": [{"id": 102, "text": "Теряюсь", "score": 30}]}, {"question_id": 24, "question_text": "Что из этого тебе откликается?", "question_type": "multi_choice", "selected_options": [{"id": 106, "text": "Я теряю контакт с телом", "score": 20}, {"id": 107, "text": "Мне трудно проявляться", "score": 30}]}]  [{"answer": "Ну", "question_id": 41, "question_text": "В какой ситуации тебе сложнее всего сохранять контакт с собой? Опиши её."}, {"answer": "Лалаьа", "question_id": 42, "question_text": "Что обычно “сбивает” тебя сильнее — мысли, эмоции или реакции других людей?"}, {"answer": "Ьалал", "question_id": 43, "question_text": "Есть ли у тебя способ вернуть себе устойчивость? Как ты это делаешь?"}, {"answer": "Лалаь", "question_id": 44, "question_text": "Что мешает тебе делать это чаще?"}]       2026-04-28 12:59:56.231041+00   2026-04-28 12:59:56.231041+00
3       2072593486      szeryoga        Sergei  Sadovnikov      200     t       \N      У тебя частичный контакт с собой     Ты уже замечаешь свои состояния, но не всегда умеешь с ними работать.\nВ стрессе можешь “выпадать” или застревать в мыслях.   Хочешь продолжить, чтобы научиться переключаться и проживать состояние?  [{"question_id": 19, "question_text": "Как ты сейчас чувствуешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 85, "text": "Вообще не понимаю", "score": 0}]}, {"question_id": 20, "question_text": "Где ты больше всего ощущаешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 89, "text": "Нигде не ощущаю", "score": 10}]}, {"question_id": 21, "question_text": "Что ты обычно делаешь, когда становится тревожно/неприятно?", "question_type": "multi_choice", "selected_options": [{"id": 93, "text": "Иду в действие (что-то делаю)", "score": 70}]}, {"question_id": 22, "question_text": "Насколько тебе легко выражать себя (эмоции, мысли)?", "question_type": "single_choice", "selected_options": [{"id": 99, "text": "Очень сложно", "score": 10}]}, {"question_id": 23, "question_text": "Когда ты в новой или стрессовой ситуации, ты чаще…", "question_type": "single_choice", "selected_options": [{"id": 103, "text": "Закрываюсь", "score": 10}]}, {"question_id": 24, "question_text": "Что из этого тебе откликается?", "question_type": "multi_choice", "selected_options": [{"id": 108, "text": "Я чувствую себя достаточно устойчиво", "score": 100}]}] []      2026-04-28 19:20:18.816784+00   2026-04-28 19:20:18.816784+00
2       141085230       lavashulya      Annushka✨              360     t       \N      У тебя хороший контакт с собой  Ты умеешь замечать и регулировать состояние,\nно, возможно, не всегда используешь это как ресурс.     Хочешь продолжить, чтобы углубить контакт и начать выражаться свободнее?      [{"question_id": 19, "question_text": "Как ты сейчас чувствуешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 83, "text": "Примерно понимаю", "score": 70}]}, {"question_id": 20, "question_text": "Где ты больше всего ощущаешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 86, "text": "В теле (напряжение, дыхание)", "score": 100}]}, {"question_id": 21, "question_text": "Что ты обычно делаешь, когда становится тревожно/неприятно?", "question_type": "multi_choice", "selected_options": [{"id": 91, "text": "Анализирую", "score": 50}]}, {"question_id": 22, "question_text": "Насколько тебе легко выражать себя (эмоции, мысли)?", "question_type": "single_choice", "selected_options": [{"id": 98, "text": "Скорее сложно", "score": 40}]}, {"question_id": 23, "question_text": "Когда ты в новой или стрессовой ситуации, ты чаще…", "question_type": "single_choice", "selected_options": [{"id": 101, "text": "Частично адаптируюсь", "score": 70}]}, {"question_id": 24, "question_text": "Что из этого тебе откликается?", "question_type": "multi_choice", "selected_options": [{"id": 105, "text": "Я часто “в голове”", "score": 30}]}]        [{"answer": "Оог", "question_id": 45, "question_text": "В какой ситуации ты в последнее время чувствовал(а) себя максимально “живым(ой)” и в контакте с собой?"}, {"answer": "Дддд", "question_id": 46, "question_text": "Что именно ты делал(а) в этот момент (действия, поведение, состояние)?"}, {"answer": "Ттти", "question_id": 47, "question_text": "Есть ли сфера, где тебе всё ещё сложно проявляться? Какая?"}, {"answer": "Лллл", "question_id": 48, "question_text": "Если представить, что ты выражаешь себя свободно — что изменится в твоей жизни?"}]  2026-04-28 13:48:46.897867+00   2026-04-28 13:48:46.897867+00
4       2072593486      szeryoga        Sergei  Sadovnikov      200     t       \N      У тебя частичный контакт с собой     Ты уже замечаешь свои состояния, но не всегда умеешь с ними работать.\nВ стрессе можешь “выпадать” или застревать в мыслях.   Хочешь продолжить, чтобы научиться переключаться и проживать состояние?  [{"question_id": 25, "question_text": "Как ты сейчас чувствуешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 112, "text": "Вообще не понимаю", "score": 0}]}, {"question_id": 26, "question_text": "Где ты больше всего ощущаешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 116, "text": "Нигде не ощущаю", "score": 10}]}, {"question_id": 27, "question_text": "Что ты обычно делаешь, когда становится тревожно/неприятно?", "question_type": "multi_choice", "selected_options": [{"id": 120, "text": "Иду в действие (что-то делаю)", "score": 70}]}, {"question_id": 28, "question_text": "Насколько тебе легко выражать себя (эмоции, мысли)?", "question_type": "single_choice", "selected_options": [{"id": 126, "text": "Очень сложно", "score": 10}]}, {"question_id": 29, "question_text": "Когда ты в новой или стрессовой ситуации, ты чаще…", "question_type": "single_choice", "selected_options": [{"id": 130, "text": "Закрываюсь", "score": 10}]}, {"question_id": 30, "question_text": "Что из этого тебе откликается?", "question_type": "multi_choice", "selected_options": [{"id": 135, "text": "Я чувствую себя достаточно устойчиво", "score": 100}]}]     []      2026-04-28 19:23:32.315649+00   2026-04-28 19:23:32.315649+00
5       2072593486      szeryoga        Sergei  Sadovnikov      200     t       \N      У тебя частичный контакт с собой     Ты уже замечаешь свои состояния, но не всегда умеешь с ними работать.\nВ стрессе можешь “выпадать” или застревать в мыслях.   Хочешь продолжить, чтобы научиться переключаться и проживать состояние?  [{"question_id": 37, "question_text": "Как ты сейчас чувствуешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 166, "text": "Вообще не понимаю", "score": 0}]}, {"question_id": 38, "question_text": "Где ты больше всего ощущаешь своё состояние?", "question_type": "single_choice", "selected_options": [{"id": 170, "text": "Нигде не ощущаю", "score": 10}]}, {"question_id": 39, "question_text": "Что ты обычно делаешь, когда становится тревожно/неприятно?", "question_type": "multi_choice", "selected_options": [{"id": 174, "text": "Иду в действие (что-то делаю)", "score": 70}]}, {"question_id": 40, "question_text": "Насколько тебе легко выражать себя (эмоции, мысли)?", "question_type": "single_choice", "selected_options": [{"id": 180, "text": "Очень сложно", "score": 10}]}, {"question_id": 41, "question_text": "Когда ты в новой или стрессовой ситуации, ты чаще…", "question_type": "single_choice", "selected_options": [{"id": 184, "text": "Закрываюсь", "score": 10}]}, {"question_id": 42, "question_text": "Что из этого тебе откликается?", "question_type": "multi_choice", "selected_options": [{"id": 189, "text": "Я чувствую себя достаточно устойчиво", "score": 100}]}]     []      2026-04-28 19:45:59.137635+00   2026-04-28 19:45:59.137635+00
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.topics (id, title, description, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_submissions; Type: TABLE DATA; Schema: public; Owner: quiz10
--

COPY public.user_submissions (id, topic_id, telegram_id, username, first_name, last_name, answers, ai_response, status, created_at, updated_at) FROM stdin;
\.


--
-- Name: app_open_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.app_open_events_id_seq', 15, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.questions_id_seq', 1, false);


--
-- Name: result_open_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.result_open_questions_id_seq', 120, true);


--
-- Name: result_ranges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.result_ranges_id_seq', 30, true);


--
-- Name: stage_one_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.stage_one_options_id_seq', 270, true);


--
-- Name: stage_one_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.stage_one_questions_id_seq', 60, true);


--
-- Name: survey_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.survey_submissions_id_seq', 5, true);


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.topics_id_seq', 1, false);


--
-- Name: user_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quiz10
--

SELECT pg_catalog.setval('public.user_submissions_id_seq', 1, false);


--
-- Name: app_open_events app_open_events_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.app_open_events
    ADD CONSTRAINT app_open_events_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: result_open_questions result_open_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.result_open_questions
    ADD CONSTRAINT result_open_questions_pkey PRIMARY KEY (id);


--
-- Name: result_ranges result_ranges_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.result_ranges
    ADD CONSTRAINT result_ranges_pkey PRIMARY KEY (id);


--
-- Name: stage_one_options stage_one_options_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.stage_one_options
    ADD CONSTRAINT stage_one_options_pkey PRIMARY KEY (id);


--
-- Name: stage_one_questions stage_one_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.stage_one_questions
    ADD CONSTRAINT stage_one_questions_pkey PRIMARY KEY (id);


--
-- Name: survey_submissions survey_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.survey_submissions
    ADD CONSTRAINT survey_submissions_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: user_submissions user_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.user_submissions
    ADD CONSTRAINT user_submissions_pkey PRIMARY KEY (id);


--
-- Name: ix_app_open_events_telegram_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_app_open_events_telegram_id ON public.app_open_events USING btree (telegram_id);


--
-- Name: ix_questions_topic_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_questions_topic_id ON public.questions USING btree (topic_id);


--
-- Name: ix_result_open_questions_result_range_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_result_open_questions_result_range_id ON public.result_open_questions USING btree (result_range_id);


--
-- Name: ix_stage_one_options_question_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_stage_one_options_question_id ON public.stage_one_options USING btree (question_id);


--
-- Name: ix_survey_submissions_result_range_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_survey_submissions_result_range_id ON public.survey_submissions USING btree (result_range_id);


--
-- Name: ix_survey_submissions_telegram_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_survey_submissions_telegram_id ON public.survey_submissions USING btree (telegram_id);


--
-- Name: ix_user_submissions_telegram_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_user_submissions_telegram_id ON public.user_submissions USING btree (telegram_id);


--
-- Name: ix_user_submissions_topic_id; Type: INDEX; Schema: public; Owner: quiz10
--

CREATE INDEX ix_user_submissions_topic_id ON public.user_submissions USING btree (topic_id);


--
-- Name: questions questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: result_open_questions result_open_questions_result_range_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.result_open_questions
    ADD CONSTRAINT result_open_questions_result_range_id_fkey FOREIGN KEY (result_range_id) REFERENCES public.result_ranges(id) ON DELETE CASCADE;


--
-- Name: stage_one_options stage_one_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.stage_one_options
    ADD CONSTRAINT stage_one_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.stage_one_questions(id) ON DELETE CASCADE;


--
-- Name: survey_submissions survey_submissions_result_range_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.survey_submissions
    ADD CONSTRAINT survey_submissions_result_range_id_fkey FOREIGN KEY (result_range_id) REFERENCES public.result_ranges(id) ON DELETE SET NULL;


--
-- Name: user_submissions user_submissions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiz10
--

ALTER TABLE ONLY public.user_submissions
    ADD CONSTRAINT user_submissions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- PostgreSQL database dump complete
--

\unrestrict BSFj0x0DCVGXdVLRb4V0hsP0MiWQDmlfrU0bAb2YlwdV3S4eq38ETazqu8kisrk
