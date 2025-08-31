0) Как пользоваться этим файлом

Выполняй задачи строго по порядку (P0 → P1 → P2).

После каждого шага Cursor:

обновляет чекбоксы статуса,

заполняет/обновляет таблицы ниже,

делает атомарный коммит (см. шаблон в конце),

запускает линтер/типы/тесты (front/back),

удаляет старый код только после 0 вхождений (ripgrep).

Любые принятые пути/имена фиксируй в таблицах ниже (old→new).

Если блокер — заполни раздел «Блокеры».

1) Глобальные правила

Никаких дублей. Перед созданием файла/метода/URL ищи аналоги: rg -n "<имя|синонимы>" .
Нашёл — переиспользуй/расширь/перенеси (git mv).

Удаляем старое только после: 0 вхождений (ripgrep), линтеры/типы/тесты зелёные, таблицы old→new обновлены.

RESTful / kebab-case / nested пути, без add_ / update_ / delete_ / mark_.

Фронт вызывает API только через SDK, сгенерированный из OpenAPI.

Коммиты атомарные, с понятным описанием «зачем/что/проверки».

Доступность (a11y) — WCAG 2.2 AA: фокус-кольца, клавиатура, контраст, reduced motion.

2) Дорожная карта и статус

 P0-10 Инвентаризация URL (DRF) и фронтовых вызовов, план унификации (таблицы)

 P0-20 OpenAPI → фронт-SDK; перевод модулей на SDK; удаление ручных вызовов

 P0-30 Side-panel (правое превью страницы), маршруты и a11y

 P0-40 Базовый UI-kit 2025 (Button/Input/Modal/Drawer) + тесты

 P0-50 Гигиена: дубли, EN-строки, мёртвый код

 P1-10 Редактор (bubble/slash/dnd/автосейв/версии/медиа)

 P1-20 Комментарии (правая панель, треды, фильтры, resolve, якоря к блокам)

 P1-30 Базы данных (таблица/доска, inline-edit, saved views, dnd)

 P2-10 Пустые/ошибки/скелетоны/подсказки/командная палитра

 P2-20 Темизация (тёмная/высокий контраст), перф, аналитика

3) Целевые принципы URL (зафиксировать)

Auth: /auth/login, /auth/token/refresh, /auth/register, /auth/me, /auth/me/password, /auth/users

Workspaces: /workspaces, /workspaces/:id, /workspaces/:id/members, /workspaces/:id/settings, /workspace-invitations, /workspace-analytics

Notes: /notes/pages, /notes/pages/:id, /notes/pages/:id/comments, /notes/pages/:id/comments/:cid, /notes/pages/:id/blocks

Databases: /databases, /databases/:id, /databases/:id/properties, /databases/:id/records, /databases/records/:rid

Tasks: /taskboards, /taskboards/:id/columns, /tasks, /tasks/:id, /tasks/:id/comments

Search: /search/search, /search/autocomplete, /search/history, /search/saved (или /search/saved-searches — выбрать и зафиксировать)

Notifications: /notifications, /notifications/settings, /notifications/reminders, /notifications/bulk

Качество API: пагинация (limit/offset), сортировка (?ordering=-updated_at), фильтры, ETag/If-None-Match (304), Idempotency-Key (POST), единый формат ошибок {code,message,details?,trace_id}.

4) Инвентаризация (заполняется Cursor-ом)
4.1 Backend: фактические DRF URL
#	Метод	Путь	View/ViewSet	Файл:Строка	Примечания
					
4.2 Frontend: все вызовы API (до миграции на SDK)
#	Файл	Функция/хук	Метод	Путь	Где используется (компоненты)
					
5) Маппинг old → new (контракт)
5.1 URL mapping (обязательная таблица)
Модуль	Старый путь	Новый путь (целевой)	Метод(ы)	Статус	Коммит/PR	Заметки
Notes	/notes/pages/:id/add_comment/	/notes/pages/:id/comments/	POST	❌		был non-REST
5.2 Front → SDK mapping
Файл/функция (front)	Был прямой вызов	Новый SDK метод	Статус	Коммит/PR
features/notes/api.ts:createComment	POST /notes/pages/:id/add_comment/	sdk.notes.createPageComment()	❌	
5.3 Deprecated/Redirects/Breaking
Элемент	Решение	Дата удаления	Кто проверил
Старые пути add_/update_/delete_	удалить без редиректов (внутренний продукт)	после миграции фронта	
6) Миграционный журнал (по модулям)

Для каждого модуля: Inventory → Target → Changes → Checks → Changelog

Шаблон записи

Модуль: <notes|databases|tasks|search|notifications|workspaces|auth>
Inventory (кратко): перечисление старых путей/вызовов
Target: финальные пути из §3
Changes: список файлов/правок
Checks: pnpm lint/typecheck/test, pytest, rg по старым путям = 0
Changelog: ссылка на коммит/PR

Модуль: notes
Inventory (кратко): 21 API вызов через axios, включая /notes/tags/, /notes/pages/, /notes/blocks/, /notes/pages/:id/comments/
Target: /notes/pages, /notes/pages/:id, /notes/pages/:id/comments, /notes/pages/:id/blocks, /notes/tags
Changes: frontend/src/features/notes/api.ts - частично переведен на SDK, frontend/src/shared/api/sdk/ - создан новый SDK
Checks: pnpm lint/typecheck/test - частично OK (есть TODO по типам), pytest - не применимо, rg по старым путям - частично заменены
Changelog: commit 652a975 - feat(sdk): P0-20 - создание OpenAPI SDK и начало миграции notes модуля

7) Гигиена/удаление/валидация

Перед удалением:

rg -n "<старый путь|имя функции|файл>" . → 0 совпадений

ESLint/TypeScript/Jest — зелёные

black/isort/mypy/pytest — зелёные

Таблицы §5 обновлены (статус ✅), журнал заполнен

8) Side-panel и маршруты (контрольные правила)

Полный режим: /pages/:id

Превью справа: /workspace?preview=:id

Back/Forward восстанавливают состояние; Esc/Overlay закрывают панель; фокус-ловушка и aria-*; resize по левому бордеру.

9) Редактор / Комментарии / Базы — контрольные чек-листы

Редактор (минимум): bubble/slash, dnd, автосейв с индикатором, версии, drag&drop медиа (превью/прогресс/ошибки).
Комментарии: правая панель 380–420px, треды до 2 уровней, фильтры, resolve, переход к блоку, хоткеи (⌘/Ctrl+Enter).
Базы: таблица (виртуализация, inline-edit, сорт/фильтр/группы, saved views), доска (DnD, быстрые действия).

10) Команды качества (front/back)
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

# Поиск дублей/старых ссылок
rg -n "<pattern>" .

11) Блокеры
Дата	Описание блокера	Варианты решения	Решение	Коммит/PR
				
12) Шаблон коммита
<type>(<area>): <кратко>

[why]
- что и почему изменили

[what]
- ключевые файлы/правки

[checks]
- linters/types/tests: OK
- old refs removed (rg=0)
- SSOT updated: docs/migration/master-spec.md#<anchor>


Типы: feat, fix, refactor, chore, docs, test.