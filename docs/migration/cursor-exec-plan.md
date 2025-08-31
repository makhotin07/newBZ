0) Глобальные правила (обязательны)

Без дублей. Перед любым созданием файла/функции/URL ищи существующее:

rg -n "<Имя|синонимы>" frontend backend

Если аналог есть — расширь/перенеси (git mv).

Создавай новое только при отсутствии аналога.

Удаление старого — в конце шага, когда:

0 результатов поиска по старым именам/путям (rg),

импорты/ссылки обновлены,

линтер/типы/тесты зелёные,

чек-лист задачи закрыт.

Единый источник правды (SSOT): docs/migration/master-spec.md.
Любое принятое имя/путь/тип сначала фиксируй там (таблица old→new).

RESTful / kebab-case / nested URL. Без add_/update_/delete_/mark_.

Коммиты атомарно: один модуль/подзадача → один коммит.
Шаблон сообщения — в каждой задаче.

Документация/комментарии — на русском.

CI-качество: Front — ESLint/TypeCheck/Jest; Back — black/isort/mypy/pytest.

1) Быстрый чек-лист статуса (отмечай по мере выполнения)

 [x] P0-00 Бутстрап (ветка, инструменты, SSOT)

 [x] P0-10 Унификация URL и OpenAPI (сквозной контракт)

 [x] P0-20 SDK из OpenAPI (единая точка API на фронте)

 [x] P0-30 Drawer/SidePanel + маршруты (просмотр страницы сбоку)

 [x] P0-40 Базовый UI-kit (Button/Input/Modal/Drawer)

 [x] P0-50 Гигиена (дубли, EN-строки, мёртвый код)

 [x] P1-10 Редактор страницы (bubble/slash, dnd, автосейв, версии)

 P1-20 Панель комментариев (треды, фильтры, resolve, hotkeys, a11y)

 P1-30 Базы данных: Table/Board (inline-edit, saved views, dnd)

 P2-10 Пустые/ошибки/скелетоны/подсказки

 P2-20 Тёмная тема, производительность, аналитика

2) Команды проверки (используй в пост-чеках)
# FRONT
cd frontend
pnpm i || yarn || npm i
pnpm lint && pnpm typecheck && pnpm test -u
cd ..

# BACK
cd backend
pip install -r requirements.txt
black --check . && isort --check-only . && mypy .
pytest -q
cd ..

# Поиск по репо (ripgrep)
rg -n "<pattern>" .

3) Зависимые документы (используй/обновляй)

docs/тз_редизайна_new_bz_frontend_backend_v_1.md — цели, токены, UX-паттерны, план итераций.

docs/migration/master-spec.md — SSOT: итоговые имена/пути, таблицы old→new, журнал миграции.

docs/audit/*.md (если есть) — карты фронт/бэк, контракты, гигиена.

P0 — Контракт, навигация, UI-база
✅ TASK P0-00 — Бутстрап (ветка, инструменты, SSOT)

Цель: подготовиться и завести SSOT.

Действия:

Создай ветку feat/redesign-p0.

Проверь наличие ripgrep; если нет — укажи, как установить.

Создай docs/migration/master-spec.md (если нет) и заполни разделы:

«Правила миграции без дублей» (скопируй из §0),

«Итоговые принципы URL/REST»,

«Таблица контрактов (пустая матрица)»,

«Журнал миграции (пусто)».

Сошлись на docs/тз_редизайна_new_bz_frontend_backend_v_1.md как на продуктовый ориентир.

Пост-чеки: линтеры/типы/тесты не требуются.

Коммит:
chore(meta): bootstrap redesign plan + SSOT master-spec

✅ TASK P0-10 — Унификация URL (сквозной контракт)

Цель: убрать расхождения фронт/бэк, стандартизировать пути.

Шаги:

Инвентаризация (без правок):

Составь таблицу всех фактических DRF URL (routers + @action): METHOD | PATH | View | файл:строка.

Составь таблицу всех фронтовых вызовов: Файл/функция → METHOD URL → где используется.

Внеси обе таблицы в master-spec.md (раздел «Контракт»).

Предложи финальные RESTful пути (kebab-case, nested). Ключевые зоны:

Notifications: /notifications/settings (а не /notification-settings)

Search: /search/history, /search/saved (или /search/saved-searches)

Tasks/Comments: только /tasks/{id}/comments/

Databases: /databases/{id}/records/, /databases/{id}/properties/
Все альтернативы и выбранный вариант — зафиксируй в SSOT (таблица old→new).

Не меняя код, приложи сюда diff-план правок (список файлов/строк), которые изменишь на следующем шаге P0-20.

Пост-чеки: отсутствуют (анализ).

Коммит:
docs(contract): unify URL plan (front↔back), SSOT mapping old→new

✅ TASK P0-20 — OpenAPI → фронт-SDK (единая точка API)

Цель: перестать руками писать пути на фронте.

Шаги:

На бэке сгенерируй OpenAPI (schema.yaml) — через drf-spectacular (manage-команда или HTTP эндпоинт).

Подключи генератор SDK (openapi-typescript / orval / openapi-generator) и сгенерируй клиент в frontend/src/shared/api/sdk.

Заменяй ручные вызовы на SDK модуль за модулем (Notifications → Search → Databases → Notes/Comments → Tasks/Comments).

В SSOT обновляй матрицу «вызов → SDK-метод».

Старые ручные обёртки удаляй после 0 ссылок (rg).

Пост-чеки: pnpm lint && pnpm typecheck && pnpm test -u, pytest -q.

Коммит:
feat(api): OpenAPI schema + generated SDK; switch module <X> to SDK; remove old wrappers

✅ TASK P0-30 — Drawer/SidePanel и маршруты

Цель: возможность открытия страницы в правой панели.

Шаги:

Добавь shared/ui/Drawer (или SidePanel) — временно можно как простой компонент (P0), a11y (focus-trap, Esc, overlay).

В роутинге:

Полный режим: /pages/:id

Превью в панели: /workspace?preview=:id (или hash/параметр)

Синхронизируй open/close в URL, поддержи «Назад».

В SSOT зафиксируй паттерн открытия страницы (full vs panel), описания состояний и a11y.

Пост-чеки: e2e-проверка вручную, юнит-тесты роутера (если есть), линтер/типы.

Коммит:
feat(ui): Drawer/SidePanel + routes for page preview; a11y/focus; docs updated

✅ TASK P0-40 — Базовый UI-kit (Button/Input/Modal/Drawer)

Цель: единые базовые компоненты со всеми состояниями.

Шаги:

Реализуй: shared/ui/Button, Input, Modal, Drawer (если не сделан выше).

Props: variant, size, isLoading, disabled, leftIcon/rightIcon, onOpenChange (Modal/Drawer).

Состояния: default/hover/active/disabled/loading, error/empty (где нужно).

A11y: роли, aria-label, focus-trap.

Создай сториз и юнит-тесты.

В SSOT опиши интерфейсы props и состояние компонентов.

Пост-чеки: pnpm lint && pnpm typecheck && pnpm test -u.

Коммит:
feat(ui-kit): base Button/Input/Modal/Drawer + stories + tests; tokens referenced

✅ TASK P0-50 — Гигиена: дубли/EN-строки/мёртвый код

Цель: навести порядок.

Шаги:

Прогон rg по известным дублям (модальные окна, хуки, API-обёртки).

Удали дубли (после 0 ссылок), замени EN-строки на локаль RU.

Отчёт по удалённому и таблица замен — в SSOT.

Пост-чеки: линтер/типы/тесты зелёные.

Коммит:
refactor(hygiene): remove duplicates & dead code; RU localization; update imports

P1 — Редактор, комментарии, базы
✅ TASK P1-10 — Редактор страницы (минимальный набор)

Цель: UX уровня Notion/Confluence (базовый).

Шаги:

Bubble-меню (B/I/U, code, link, highlight) и Slash-меню / (заголовки, список, todo, цитата, код, изображение, файл, таблица/БД).

DnD блоков (хэндлы слева), «+» между блоками.

Автосохранение (индикатор), базовая история версий (API подключить/согласовать).

Загрузка медиа: превью, прогресс, ошибки.

A11y: hotkeys (Ctrl/⌘+B/I/U/K, Ctrl/⌘+Enter по месту).

Пост-чеки: UX-скрипты (ручные), unit для утилит/плагинов.

Коммит:
feat(editor): bubble/slash menu, dnd blocks, autosave, basic versions, media upload

✅ TASK P1-20 — Панель комментариев (треды, фильтры, resolve)

Цель: рабочие обсуждения справа.

Шаги:

Fixed правая панель 380–420px, header «Комментарии (N)» + фильтры (все/открытые/мои/решённые).

Карточка: аватар, автор, дата, текст, действия (Ответить/Resolve/⋯), уровень вложенности до 2, подсветка привязки к блоку.

Инпут снизу (fixed), auto-resize, Ctrl/⌘+Enter — отправка.

API: использовать nested /pages/{id}/comments/ (лист/создание) и /pages/{id}/comments/{cid} (CRUD).

A11y: роли/aria, таб-навигация, фокус-ловушки при модалках.

Пост-чеки: ручные сценарии + unit/RTL тесты.

Коммит:
feat(comments): side panel with threads/filters/resolve; nested REST endpoints

[x] TASK P1-30 — Базы данных: Table/Board (MVP)

Цель: управляемые представления.

Шаги:

Table-view: inline-edit, сорт/фильтр/группы, сохранённые представления.

Board-view: dnd карточек, быстрые действия (assign/due/priority/tags).

API: /databases/{id}/records/, /databases/{id}/properties/; никакого add_*/_detail.

Пустые состояния/ошибки/скелетоны.

Пост-чеки: ручные сценарии (создать БД → открыть → редактировать), unit/RTL для компонентов.

Коммит:
feat(database): table/board views with inline edit & saved views; RESTful endpoints

P2 — Полировка
[x] TASK P2-10 — Пустые/ошибки/скелетоны/подсказки

Коммит:
feat(ux): empty/error/loading states & hints across key screens

✅ TASK P2-20 — Тёмная тема, перф, аналитика

Коммит:
feat(theming+perf): dark mode tokens, code-splitting, RUM events

4) Правила валидации перед удалением старого кода

rg -n "<старый путь|символ>" . → нет вхождений.

API-контракт в SSOT помечен как ✅.

Линтеры/типы/тесты — зелёные.

В changelog задачи перечислены удалённые файлы/символы.

5) Шаблон коммит-сообщения
<type>(<area>): <short summary>

[why]
- что и зачем менялось (1–2 пункта)

[what]
- ключевые изменения (файлы/модули)

[checks]
- linters/types/tests passed
- old refs removed (rg=0)
- SSOT updated (#anchor)


Типы: feat, fix, refactor, chore, docs, test.

6) Журнал миграции

Заполняй в docs/migration/master-spec.md для каждого модуля: Inventory → Target → Checks → Changelog.

Конец файла.