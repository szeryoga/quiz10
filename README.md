# Quiz10

`quiz10` — Telegram Mini App "10 вопросов" с frontend, admin, backend и PostgreSQL.

URL через gateway:

- mini app: `https://quiz10.etalonfood.com/app`
- admin: `https://quiz10.etalonfood.com/admin`
- api: `https://quiz10.etalonfood.com/api`

## Структура

```text
quiz10/
  docker-compose.yml
  docker-compose.local.yml
  .env.example
  frontend/
  admin/
  backend/
```

## Подготовка

```bash
cp .env.example .env
```

Заполните как минимум:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

Опционально для ИИ и уведомлений:

- `XAI_API_KEY`
- `XAI_MODEL`
- `TELEGRAM_BOT_TOKEN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## Локальный запуск

```bash
./scripts/local-dev.sh
```

Локально должны работать:

- mini app: `http://127.0.0.1:3004/app`
- admin: `http://127.0.0.1:3004/admin`
- api: `http://127.0.0.1:3004/api/`
- healthcheck: `http://127.0.0.1:3004/health`
- api docs: `http://127.0.0.1:8001/docs`

Остановка:

```bash
./scripts/local-dev-stop.sh
```

## Production запуск

```bash
./scripts/prod-up.sh
```

Сервисы для gateway:

- `quiz10-frontend:80`
- `quiz10-admin:80`
- `quiz10-backend:8000`

Остановка production:

```bash
./scripts/prod-stop.sh
```

## Host Network Диагностика

Если нужно быстро проверить, связана ли проблема исходящего трафика `backend` с docker networking, используйте временный override:

```bash
docker compose -f docker-compose.yml -f docker-compose.hostnet-test.yml up -d --build postgres backend_hostnet_test
```

Что делает этот режим:

- публикует `postgres` на `127.0.0.1:15432`
- запускает отдельный диагностический сервис `backend_hostnet_test` в `host` network
- переводит этот сервис на работу с Postgres через `127.0.0.1:15432`
- поднимает его на `127.0.0.1:18000`
- основной сервис `backend` и основной route через gateway не трогает

Проверка Telegram из этого режима:

```bash
docker compose -f docker-compose.yml -f docker-compose.hostnet-test.yml exec -T backend_hostnet_test python -c "import os,urllib.request; token=os.environ['TELEGRAM_BOT_TOKEN']; url=f'https://api.telegram.org/bot{token}/getMe'; r=urllib.request.urlopen(url, timeout=10); print(r.status); print(r.read().decode())"
```

Если в `host` network Telegram начинает работать, проблема находится в bridge/NAT/network routing Docker, а не в коде `quiz10`.

## Gateway

В `gateway/config/routes.yml` должен быть домен:

```yaml
- host: quiz10.etalonfood.com
  routes:
    - path: /app
      upstream: http://quiz10-frontend:80
    - path: /admin
      upstream: http://quiz10-admin:80
    - path: /api
      upstream: http://quiz10-backend:8000
      strip_prefix: false
```

## Telegram Mini App

Для подключения к Telegram:

1. Создайте или используйте бота.
2. В настройках Mini App укажите URL:
   `https://quiz10.etalonfood.com/app`
3. Убедитесь, что домен доступен по HTTPS.
4. Если нужен Telegram admin notify, задайте:
   - `TELEGRAM_BOT_TOKEN`
   - `admin_telegram_chat_id` в админке

## Что делает backend

- создает таблицы при старте через `metadata.create_all`
- сидит 3 стартовые темы по 10 вопросов
- считает лимиты открытий
- сохраняет отправки пользователей
- пытается анализировать ответы через xAI/Grok
- уведомляет админа в Telegram и/или email

## Админка

Логин:

- пароль берется из `ADMIN_PASSWORD`
- логин-фраза не нужна, только пароль

Разделы:

- Submissions
- Topics
- Settings
