# FITFLOW_EXECUTION_PLAN.md
## FitFlow — Execution Plan (step-by-step)

Цель: вести разработку FitFlow по понятным шагам, чтобы Codex мог выполнять задачи последовательно и предсказуемо.

---

## 0) Общие правила (обязательно)

1) **Строго следовать шагам**: выполнять только один Step за раз.  
2) **Не добавлять новые библиотеки** без явного запроса.  
3) **Каждый Step = отдельный commit** (или отдельный PR), с понятным названием.  
4) **После каждого Step** вывести:
   - что сделано (кратко)
   - список изменённых/созданных файлов
   - как проверить (команды/URL)
5) **Не менять архитектуру/структуру** без согласования.
6) Если встречается неопределённость — **использовать дефолт из документации FitFlow** (React 18 + TS, Tailwind, shadcn/ui, Zustand, React Query, React Router, Supabase).
7) Код писать **типобезопасно**, без `any` (кроме крайних случаев с комментарием почему).

---

## 1) Технологии и стандарты проекта

### 1.1 Стек (фиксируем)
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI)
- React Router
- TanStack Query (React Query)
- Zustand
- React Hook Form + Zod
- Supabase JS SDK
- date-fns
- Recharts
- Framer Motion (по мере надобности)

### 1.2 Базовые принципы
- Feature-based структура (src/features/*)
- UI-компоненты: src/components/ui + src/components/layout
- Данные: Supabase через src/lib/supabase.ts
- Типы: src/types (включая database.types.ts)

---

## Step 1 — Инициализация проекта (Vite + базовая структура)

### Goal
Создать новый проект React+TS на Vite и подготовить структуру папок.

### Tasks
- [ ] Создать Vite React TS проект
- [ ] Настроить алиас `@` -> `src`
- [ ] Создать структуру папок (как в техдоке)
- [ ] Добавить базовые страницы-заглушки

### Output / Acceptance
- `pnpm dev` запускается без ошибок
- открывается страница `/` (Landing) с простым контентом

### Files
- `src/app/*`
- `src/pages/*`
- `src/components/*`
- `src/lib/*`
- `src/store/*`
- `src/types/*`
- `src/styles/globals.css`

---

## Step 2 — Tailwind CSS (и базовые стили)

### Goal
Подключить Tailwind и глобальные стили.

### Tasks
- [ ] Установить Tailwind + PostCSS
- [ ] Настроить `tailwind.config`
- [ ] Подключить `globals.css`
- [ ] Проверить работу классов Tailwind на странице

### Output / Acceptance
- На Landing применяется Tailwind (например, центрирование, отступы, типографика)

---

## Step 3 — shadcn/ui (UI библиотека)

### Goal
Подключить shadcn/ui и убедиться, что компоненты работают.

### Tasks
- [ ] Инициализировать shadcn/ui
- [ ] Добавить базовые компоненты: Button, Card, Input, Label
- [ ] Использовать Button/Card на Landing

### Output / Acceptance
- Компоненты shadcn/ui отображаются корректно
- Нет ошибок сборки/типов

---

## Step 4 — Роутинг (React Router) + Layout

### Goal
Настроить роутинг согласно карте сайта и сделать общий Layout для авторизованной части.

### Tasks
- [ ] Установить React Router
- [ ] Создать `src/app/router.tsx`
- [ ] Завести публичные страницы: Landing, Login, Register, Reset Password
- [ ] Завести защищённый layout: `/app/*` (Dashboard и другие заглушки)
- [ ] Создать `Layout` + `Header` + `BottomNav` (мобайл) + `Sidebar` (десктоп, пока как заглушка)

### Output / Acceptance
- Работают переходы:
  - `/` `/login` `/register` `/reset-password`
  - `/app/dashboard` (пока без защиты, защита будет следующим шагом)

---

## Step 5 — Supabase client + env

### Goal
Подключить Supabase и подготовить окружение.

### Tasks
- [ ] Добавить `.env.example` с `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Создать `src/lib/supabase.ts` (инициализация клиента)
- [ ] Добавить `src/lib/constants.ts` (ключи, лимиты, и т.д.)

### Output / Acceptance
- Приложение собирается и стартует
- Supabase client импортируется без ошибок

---

## Step 6 — Auth: Zustand store + хуки

### Goal
Сделать основу авторизации: состояние пользователя, загрузка, logout.

### Tasks
- [ ] `src/store/authStore.ts` (user, profile, loading)
- [ ] `src/hooks/useAuth.ts` (подписка на изменения сессии)
- [ ] `logout()` вызывает `supabase.auth.signOut()`

### Output / Acceptance
- В консоли можно увидеть текущее состояние auth (временно)
- Логаут очищает store

---

## Step 7 — ProtectedRoute + редиректы

### Goal
Ограничить доступ к `/app/*` неавторизованным пользователям.

### Tasks
- [ ] Компонент `ProtectedRoute`
- [ ] Если нет user — редирект на `/login`
- [ ] Если user есть, но onboarding не пройден — редирект на `/onboarding`

### Output / Acceptance
- Неавторизованный не попадает в `/app/dashboard`
- Авторизованный попадает
- Авторизованный без onboarding уходит на `/onboarding`

---

## Step 8 — Auth UI: Login/Register/Reset pages

### Goal
Реализовать формы auth согласно функциональной спецификации.

### Tasks
- [ ] React Hook Form + Zod для валидации
- [ ] Register: email/password/confirm + проверки
- [ ] Login: email/password
- [ ] Reset: email
- [ ] Обработка ошибок и показ сообщений

### Output / Acceptance
- Регистрация и логин работают через Supabase Auth
- Ошибки показываются пользователю

---

## Step 9 — Onboarding (3 шага) + сохранение профиля

### Goal
Сделать онбординг и запись профиля в `users_profiles`.

### Tasks
- [ ] `/onboarding` (3 шага)
- [ ] Step1: personal info (name, age, gender, height, weight)
- [ ] Step2: goal, activity, fitness level
- [ ] Step3: workouts per week + equipment + "Generate plan"
- [ ] Рассчитать BMR/TDEE/target calories (из техдока) и сохранить в таблицу профиля
- [ ] `onboarding_completed = true`

### Output / Acceptance
- Профиль создаётся/обновляется в БД
- После завершения — переход на `/app/dashboard`

---

## Step 10 — Database setup scripts (Supabase SQL)

### Goal
Подготовить SQL миграции/скрипты для таблиц из техдока.

### Tasks
- [ ] Создать папку `supabase/sql/`
- [ ] Разбить на файлы:
  - `001_users_profiles.sql`
  - `002_weight_history.sql`
  - `003_exercises.sql`
  - `004_workout_plans.sql`
  - `005_workouts.sql`
  - `006_workout_exercises.sql`
  - `007_workout_sessions.sql`
  - `008_session_exercises.sql`
  - `009_water_tracking.sql`
  - `010_steps_tracking.sql`
  - `011_calories_tracking.sql`
  - `012_notification_settings.sql`
- [ ] Добавить RLS policies (как в техдоке)

### Output / Acceptance
- Скрипты готовы к запуску в Supabase SQL Editor

---

## Step 11 — Exercises: список + поиск/фильтры (MVP)

### Goal
Сделать страницу библиотеки упражнений: browse, search, filters.

### Tasks
- [ ] React Query: загрузка упражнений
- [ ] UI: список карточек
- [ ] Поиск по имени (минимум локальный фильтр, лучше Supabase textSearch)
- [ ] Фильтры: category, difficulty, equipment
- [ ] `/exercises/:id` — детальная страница упражнения

### Output / Acceptance
- Пользователь видит упражнения, умеет искать и открывать детальную страницу

---

## Step 12 — Workout Plan: получение активного плана + просмотр

### Goal
Отображать активный план и тренировки.

### Tasks
- [ ] Запрос активного плана + workouts + workout_exercises + exercise
- [ ] `/app/workouts/plan` список тренировок
- [ ] `/app/workouts/:id` детали тренировки (список упражнений)

### Output / Acceptance
- Пользователь видит текущий план и детали выбранной тренировки

---

## Step 13 — Workout Session: старт, трекинг подходов, завершение

### Goal
Реализовать “Active Workout Session” как в UX.

### Tasks
- [ ] Start session: создать запись `workout_sessions`
- [ ] UI с шагами упражнений
- [ ] Трекинг подходов (в памяти + сохранение в `session_exercises`)
- [ ] Таймер отдыха
- [ ] Завершение: обновить `workout_sessions` (end_time, duration, completed, calories_burned)

### Output / Acceptance
- Можно пройти тренировку, отметить подходы, завершить, увидеть summary

---

## Step 14 — Dashboard (MVP)

### Goal
Собрать главную страницу: Today, Quick actions, Weekly summary, Upcoming.

### Tasks
- [ ] Today workout card (берётся из плана/календаря)
- [ ] Quick actions (ссылки на трекеры/прогресс)
- [ ] Weekly summary (выполнено/запланировано)
- [ ] Upcoming workouts list

### Output / Acceptance
- Дашборд отображает реальную информацию пользователя

---

## Step 15 — Progress: вес + график

### Goal
Вес пользователя: добавление, история, график.

### Tasks
- [ ] Добавление веса (modal)
- [ ] Сохранение в `weight_history`
- [ ] График (Recharts)
- [ ] Показ прогресса к target_weight (если задан)

### Output / Acceptance
- Вес добавляется, список и график обновляются

---

## Step 16 — Calendar (Week/Month MVP)

### Goal
Календарь тренировок (без сложного drag&drop на первом этапе).

### Tasks
- [ ] Week view + Month view
- [ ] Индикаторы (planned/completed)
- [ ] Клик по дню -> детали

### Output / Acceptance
- Календарь показывает тренировки по дням

---

## Step 17 — Water Tracker (MVP)

### Goal
Трекер воды: цель, быстрое добавление, история за день.

### Tasks
- [ ] `water_tracking` upsert по (user_id, date)
- [ ] Quick add 250/500/1000
- [ ] Entries list
- [ ] Progress circle

### Output / Acceptance
- Вода добавляется, прогресс и список обновляются

---

## Step 18 — Steps Tracker (MVP)

### Goal
Трекер шагов: ручной ввод + расчеты.

### Tasks
- [ ] Ввод actual_steps
- [ ] Расчёт distance_km + calories_burned
- [ ] Сохранение в `steps_tracking` (upsert)

### Output / Acceptance
- Шаги сохраняются, показываются метрики

---

## Step 19 — Calories Tracker (MVP)

### Goal
Трекер калорий: meals JSONB + баланс.

### Tasks
- [ ] Добавление meal (тип, время, items)
- [ ] Подсчёт total consumed
- [ ] Баланс (consumed - burned)
- [ ] Сохранение в `calories_tracking`

### Output / Acceptance
- Питание добавляется, метрики обновляются

---

## Step 20 — Notifications settings (UI + storage)

### Goal
Экран настроек уведомлений + запись в `notification_settings`.

### Tasks
- [ ] UI тумблеры и поля времени
- [ ] Load/save настройки
- [ ] Уважать quiet hours на уровне UI (позже — на уровне отправки)

### Output / Acceptance
- Настройки сохраняются и восстанавливаются

---

## Step 21 — Edge Functions: generate-workout-plan + calculate-calories

### Goal
Добавить Edge Functions и интегрировать с фронтом.

### Tasks
- [ ] Создать функцию генерации плана
- [ ] Запись плана и тренировок в БД
- [ ] calculate-calories для breakdown
- [ ] Вызовы с фронта

### Output / Acceptance
- Онбординг генерирует план через функцию, а не локально

---

## Step 22 — Тесты (минимум для MVP)

### Goal
Покрыть критичные расчёты и основные потоки.

### Tasks
- [ ] Unit tests: BMR/TDEE/target calories
- [ ] E2E: register -> onboarding -> dashboard -> start workout
- [ ] Базовый линт/формат

### Output / Acceptance
- Тесты проходят в CI локально

---

## Step 23 — PWA базовая конфигурация

### Goal
Включить PWA: manifest + service worker.

### Tasks
- [ ] vite-plugin-pwa
- [ ] manifest icons placeholders
- [ ] caching strategy (NetworkFirst для API, CacheFirst для images)

### Output / Acceptance
- Lighthouse PWA базово проходит, приложение устанавливается

---

## Step 24 — Полировка UI/UX + a11y

### Goal
Loading/empty/error states, accessibility, мелкие улучшения.

### Tasks
- [ ] Skeletons
- [ ] Error boundaries
- [ ] Focus styles
- [ ] aria labels
- [ ] prefers-reduced-motion

### Output / Acceptance
- UX стабильный, нет “пустых белых экранов”

---

## Step 25 — Deployment + Monitoring

### Goal
Деплой на Vercel/Netlify, Sentry, env.

### Tasks
- [ ] Env vars
- [ ] Build pipeline
- [ ] Sentry init
- [ ] Smoke test сценарии

### Output / Acceptance
- Прод окружение доступно и мониторится

---

## Как запускать Codex

Пример команды/инструкции для Codex:

1) Прочитай `FITFLOW_EXECUTION_PLAN.md`
2) Выполняй Step 1
3) После завершения выведи:
   - Summary
   - Files changed
   - How to verify
4) Остановись и жди подтверждения перед следующим шагом
