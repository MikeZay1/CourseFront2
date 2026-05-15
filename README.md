# TutorSpace (SPA)

Клиент React + TypeScript для записи на занятия.

## Режимы API

### 1. Встроенный мок (по умолчанию)

`VITE_USE_MOCK=true` — запросы не уходят в сеть, ответы имитируются в браузере (`localStorage`).

### 2. Локальный REST-сервер (реальный HTTP)

Поднимает Express с тем же контрактом, что и мок; данные в `server/data/state.json` (создаётся автоматически из `data/lessons.seed.json`).

```bash
npm install
npm run dev:api
```

Откройте приложение как обычно (Vite). В `.env` для этого режима задайте:

```env
VITE_USE_MOCK=false
VITE_DEV_PROXY=true
VITE_API_PROXY_TARGET=http://localhost:4000
```

Команда `dev:api` запускает параллельно `npm run api` (порт **4000**) и `npm run dev`. Прокси в `vite.config.ts` пересылает `/auth`, `/lessons`, `/dashboard` на бэкенд.

Отдельно только API:

```bash
npm run api
```

### 3. Внешний сервер (staging / production)

```env
VITE_USE_MOCK=false
VITE_DEV_PROXY=false
VITE_API_URL=https://ваш-хост
```

Бэкенд должен отдавать JSON по путям: `POST /auth/login`, `POST /auth/register`, `GET /dashboard`, `GET /lessons` (query — фильтры), `GET|PUT|DELETE /lessons/:id`, `POST /lessons`. Заголовок `Authorization: Bearer <token>` — после логина.

Таймаут запросов: `VITE_API_TIMEOUT_MS` (по умолчанию 15000).

## Картинки

Обложки и аватары по умолчанию — **локальные SVG** в `public/placeholders/` (без внешних CDN). Компонент `MediaImg` подставляет `import.meta.env.BASE_URL`, чтобы пути работали на GitHub Pages. Внешние `https://…` в полях `coverImageUrl` / `avatarUrl` по-прежнему поддерживаются.

```bash
npm install
npm run dev
npm run dev:api
npm run api
npm test
npm run lint
npm run build
```

## GitHub Pages

1. Репозиторий с **корнем в этой папке** (`tutoring-spa`).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. В CI при сборке задаётся `VITE_BASE_URL=/<имя-репозитория>/`. Локально для проверки Pages добавьте в `.env` тот же путь.
4. После `npm run build` скрипт `postbuild` копирует `index.html` в `404.html` (SPA-fallback на GitHub Pages).
5. Поле `homepage` в `package.json` замените на URL вида `https://<user>.github.io/<repo>/`.

На Pages сборка идёт с моком в браузере (`VITE_USE_MOCK=true` в workflow), отдельный Node API туда не деплоится.

### Белый / пустой экран на Pages

Сайт project pages открывается как `https://<user>.github.io/<repo>/`, поэтому в бандле должен быть **`base: /<имя-репозитория>/`**. В `vite.config.ts` при сборке в Actions автоматически берётся путь из переменной **`GITHUB_REPOSITORY`** (и дублируется `VITE_BASE_URL` в workflow). Если страница пустая, в DevTools → Network проверьте **404 на файлы `/assets/*.js`**: значит `base` был `/` — закоммитьте актуальный `vite.config.ts` и перезапустите workflow.
