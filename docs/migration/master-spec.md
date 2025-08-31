# Master Specification (SSOT) - Миграция на новый дизайн

## Правила миграции без дублей

Без дублей. Перед любым созданием файла/функции/URL ищи существующее:

```bash
rg -n "<Имя|синонимы>" frontend backend
```

Если аналог есть — расширь/перенеси (git mv).

Создавай новое только при отсутствии аналога.

Удаление старого — в конце шага, когда:
- 0 результатов поиска по старым именам/путям (rg),
- импорты/ссылки обновлены,
- линтер/типы/тесты зелёные,
- чек-лист задачи закрыт.

Единый источник правды (SSOT): docs/migration/master-spec.md.
Любое принятое имя/путь/тип сначала фиксируй там (таблица old→new).

RESTful / kebab-case / nested URL. Без add_/update_/delete_/mark_.

Коммиты атомарно: один модуль/подзадача → один коммит.

Документация/комментарии — на русском.

CI-качество: Front — ESLint/TypeCheck/Jest; Back — black/isort/mypy/pytest.

## Итоговые принципы URL/REST

### Структура URL
- **Формат**: `/api/v1/{resource}/{id}/{sub-resource}`
- **Стиль**: kebab-case (например: `/workspace-settings`)
- **Вложенность**: максимум 3 уровня для читаемости
- **Действия**: через HTTP методы, без add_/update_/delete_/mark_

### Ключевые зоны
- **Notifications**: `/notifications/settings` (а не `/notification-settings`)
- **Search**: `/search/history`, `/search/saved` (или `/search/saved-searches`)
- **Tasks/Comments**: только `/tasks/{id}/comments/`
- **Databases**: `/databases/{id}/records/`, `/databases/{id}/properties/`

## Таблица контрактов (old → new)

### DRF URL (backend/api/urls.py)

| METHOD | PATH | View | Файл:строка | Статус |
|--------|------|------|-------------|---------|
| GET/POST/PUT/PATCH/DELETE | `/databases/` | DatabaseViewSet | database_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/comments/` | DatabaseCommentViewSet | database_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/taskboards/` | TaskBoardViewSet | taskboard_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/tasks/` | TaskViewSet | taskboard_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/notes/pages/` | PageViewSet | note_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/notes/tags/` | TagViewSet | note_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/notes/blocks/` | BlockViewSet | note_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/workspaces/` | WorkspaceViewSet | workspace_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/workspaces/invitations/` | WorkspaceInvitationViewSet | workspace_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/workspaces/analytics/` | WorkspaceAnalyticsViewSet | workspace_analytics_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/search/` | SearchViewSet | search_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/search/history/` | SearchHistoryViewSet | search_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/search/saved/` | SavedSearchViewSet | search_views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/notifications/` | NotificationViewSet | notifications/views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/notifications/settings/` | NotificationSettingsViewSet | notifications/views.py | ⏳ Анализ |
| GET/POST/PUT/PATCH/DELETE | `/notifications/reminders/` | ReminderViewSet | notifications/views.py | ⏳ Анализ |
| GET | `/notes/pages/<page_id>/comments/` | PageCommentsListView | note_views.py | ⏳ Анализ |
| GET/PUT/PATCH/DELETE | `/notes/pages/<page_id>/comments/<pk>/` | PageCommentDetailView | note_views.py | ⏳ Анализ |
| PATCH | `/notes/pages/<page_id>/comments/<pk>/resolve/` | PageCommentResolveView | note_views.py | ⏳ Анализ |
| POST | `/auth/login/` | CustomTokenObtainPairView | account_views.py | ⏳ Анализ |
| POST | `/auth/token/refresh/` | TokenRefreshView | rest_framework_simplejwt | ⏳ Анализ |
| POST | `/auth/register/` | UserRegistrationView | account_views.py | ⏳ Анализ |
| GET/PATCH | `/auth/me/` | UserProfileView | account_views.py | ⏳ Анализ |
| PATCH | `/auth/me/password/` | change_password | account_views.py | ⏳ Анализ |
| GET | `/auth/users/` | UserListView | account_views.py | ⏳ Анализ |
| POST | `/auth/password-reset/` | forgot_password | account_views.py | ⏳ Анализ |
| POST | `/auth/password-reset/confirm/` | reset_password | account_views.py | ⏳ Анализ |

### @action методы (дополнительные URL)

| METHOD | PATH | View | Файл:строка | Статус |
|--------|------|------|-------------|---------|
| GET | `/workspaces/{id}/members/` | WorkspaceViewSet | workspace_views.py:53 | ⏳ Анализ |
| GET | `/workspaces/{id}/members/me/` | WorkspaceViewSet | workspace_views.py:62 | ⏳ Анализ |
| DELETE | `/workspaces/{id}/members/me/` | WorkspaceViewSet | workspace_views.py:74 | ⏳ Анализ |
| POST | `/workspaces/{id}/invite/` | WorkspaceViewSet | workspace_views.py:83 | ⏳ Анализ |
| GET/PATCH | `/workspaces/{id}/settings/` | WorkspaceViewSet | workspace_views.py:102 | ⏳ Анализ |
| PATCH | `/workspaces/{id}/members/{member_id}/` | WorkspaceViewSet | workspace_views.py:122 | ⏳ Анализ |
| DELETE | `/workspaces/{id}/members/{member_id}/` | WorkspaceViewSet | workspace_views.py:137 | ⏳ Анализ |
| GET | `/workspaces/{id}/analytics/` | WorkspaceViewSet | workspace_views.py:148 | ⏳ Анализ |
| GET | `/workspaces/{id}/task-stats/` | WorkspaceViewSet | workspace_views.py:158 | ⏳ Анализ |
| GET | `/workspaces/invitations/` | WorkspaceInvitationViewSet | workspace_views.py:179 | ⏳ Анализ |
| POST | `/workspaces/invitations/accept/` | WorkspaceInvitationViewSet | workspace_views.py:190 | ⏳ Анализ |
| POST | `/workspaces/{id}/accept/` | WorkspaceViewSet | workspace_views.py:214 | ⏳ Анализ |
| POST | `/workspaces/{id}/decline/` | WorkspaceViewSet | workspace_views.py:231 | ⏳ Анализ |
| GET | `/workspaces/analytics/overview/` | WorkspaceAnalyticsViewSet | workspace_analytics_views.py:32 | ⏳ Анализ |
| GET | `/databases/{id}/records/` | DatabaseViewSet | database_views.py:57 | ⏳ Анализ |
| POST | `/databases/{id}/records/` | DatabaseViewSet | database_views.py:62 | ⏳ Анализ |
| GET | `/databases/{id}/properties/` | DatabaseViewSet | database_views.py:75 | ⏳ Анализ |
| POST | `/databases/{id}/properties/` | DatabaseViewSet | database_views.py:81 | ⏳ Анализ |
| GET | `/databases/{id}/views/` | DatabaseViewSet | database_views.py:94 | ⏳ Анализ |
| POST | `/databases/{id}/views/` | DatabaseViewSet | database_views.py:99 | ⏳ Анализ |
| GET | `/databases/{id}/export/` | DatabaseViewSet | database_views.py:133 | ⏳ Анализ |
| GET | `/databases/{id}/import/` | DatabaseViewSet | database_views.py:139 | ⏳ Анализ |
| POST | `/databases/{id}/import/` | DatabaseViewSet | database_views.py:145 | ⏳ Анализ |
| GET/POST | `/notes/pages/{id}/share/` | PageViewSet | note_views.py:71 | ⏳ Анализ |
| POST | `/search/search/` | SearchViewSet | search_views.py:21 | ⏳ Анализ |
| GET | `/search/suggestions/` | SearchViewSet | search_views.py:43 | ⏳ Анализ |
| GET | `/search/global/` | SearchViewSet | search_views.py:59 | ⏳ Анализ |
| GET | `/search/workspace/{workspace_id}/` | SearchViewSet | search_views.py:80 | ⏳ Анализ |
| DELETE | `/search/history/clear/` | SearchViewSet | search_views.py:121 | ⏳ Анализ |
| POST | `/saved-searches/{id}/execute/` | SavedSearchViewSet | search_views.py:159 | ⏳ Анализ |
| GET/POST | `/taskboards/{id}/columns/` | TaskBoardViewSet | taskboard_views.py:59 | ⏳ Анализ |
| GET/POST | `/taskboards/{id}/tasks/` | TaskBoardViewSet | taskboard_views.py:82 | ⏳ Анализ |
| PATCH | `/taskboards/{id}/reorder/` | TaskBoardViewSet | taskboard_views.py:212 | ⏳ Анализ |
| GET/POST | `/tasks/{id}/comments/` | TaskViewSet | taskboard_views.py:234 | ⏳ Анализ |
| GET | `/tasks/{id}/activity/` | TaskViewSet | taskboard_views.py:245 | ⏳ Анализ |

### Фронтовые API вызовы (features/*/api.ts)

| Файл/функция | METHOD URL | Где используется | Статус |
|--------------|------------|------------------|---------|
| notifications/api.ts | GET `/notifications/` | useNotifications | ⏳ Анализ |
| notifications/api.ts | PATCH `/notifications/{id}/` | useNotifications | ⏳ Анализ |
| notifications/api.ts | POST `/notifications/mark_all_read/` | useNotifications | ⏳ Анализ |
| notifications/api.ts | DELETE `/notifications/{id}/` | useNotifications | ⏳ Анализ |
| notifications/api.ts | GET `/notification-settings/` | useNotifications | ⏳ Анализ |
| notifications/api.ts | PATCH `/notification-settings/` | useNotifications | ⏳ Анализ |
| notifications/api.ts | GET/POST/PATCH/DELETE `/reminders/` | useNotifications | ⏳ Анализ |
| auth/api.ts | GET/PATCH `/auth/me/` | useAuth | ⏳ Анализ |
| auth/api.ts | PATCH `/auth/me/password/` | useAuth | ⏳ Анализ |
| auth/api.ts | POST `/auth/password-reset/` | useAuth | ⏳ Анализ |
| auth/api.ts | POST `/auth/password-reset/confirm/` | useAuth | ⏳ Анализ |
| workspaces/api.ts | GET/POST/PUT/PATCH/DELETE `/workspaces/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | GET `/workspaces/{id}/members/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | POST `/workspaces/{id}/invite/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | GET/PATCH `/workspaces/{id}/settings/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | PATCH `/workspaces/{id}/members/{member_id}/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | DELETE `/workspaces/{id}/members/{member_id}/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | GET `/workspaces/{id}/analytics/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | GET `/workspaces/{id}/task-stats/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | GET/POST `/workspaces/invitations/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | POST `/workspaces/{id}/accept/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | POST `/workspaces/{id}/decline/` | useWorkspaces | ⏳ Анализ |
| workspaces/api.ts | GET `/workspaces/analytics/overview/` | useWorkspaces | ⏳ Анализ |
| notes/api.ts | GET/POST/PUT/PATCH/DELETE `/notes/pages/` | useNotes | ⏳ Анализ |
| notes/api.ts | GET/POST/PUT/PATCH/DELETE `/notes/tags/` | useNotes | ⏳ Анализ |
| notes/api.ts | GET/POST/PUT/PATCH/DELETE `/notes/blocks/` | useNotes | ⏳ Анализ |
| notes/api.ts | GET `/notes/workspace/{workspaceId}/recent/` | useNotes | ⏳ Анализ |
| notes/api.ts | POST `/notes/pages/{pageId}/share/` | useNotes | ⏳ Анализ |
| tasks/api.ts | GET/POST/PUT/PATCH/DELETE `/taskboards/` | useTasks | ⏳ Анализ |
| tasks/api.ts | GET/POST/PUT/PATCH/DELETE `/tasks/` | useTasks | ⏳ Анализ |
| tasks/api.ts | GET/POST `/taskboards/{id}/columns/` | useTasks | ⏳ Анализ |
| tasks/api.ts | PATCH `/tasks/{id}/move/` | useTasks | ⏳ Анализ |
| tasks/api.ts | GET `/tasks/{id}/activity/` | useTasks | ⏳ Анализ |
| search/api.ts | POST `/search/search/` | useSearch | ⏳ Анализ |
| search/api.ts | GET `/search/global/` | useSearch | ⏳ Анализ |
| search/api.ts | GET `/search/workspace/{workspace_id}/` | useSearch | ⏳ Анализ |
| search/api.ts | GET `/search/autocomplete/` | useSearch | ⏳ Анализ |
| search/api.ts | GET/POST/DELETE `/search-history/` | useSearch | ⏳ Анализ |
| search/api.ts | GET/POST/PATCH/DELETE `/saved-searches/` | useSearch | ⏳ Анализ |
| search/api.ts | POST `/saved-searches/{id}/execute/` | useSearch | ⏳ Анализ |
| databases/api.ts | GET/POST/PUT/PATCH/DELETE `/databases/` | useDatabases | ⏳ Анализ |
| databases/api.ts | GET/POST/PUT/PATCH/DELETE `/databases/{id}/properties/` | useDatabases | ⏳ Анализ |
| databases/api.ts | GET/POST/PUT/PATCH/DELETE `/databases/{id}/records/` | useDatabases | ⏳ Анализ |
| databases/api.ts | GET/POST/PUT/PATCH/DELETE `/databases/{id}/views/` | useDatabases | ⏳ Анализ |

### Предлагаемые финальные RESTful пути

| Текущий | Предлагаемый | Обоснование |
|---------|---------------|-------------|
| `/notification-settings/` | `/notifications/settings/` | Убрать дефис, сделать nested |
| `/search-history/` | `/search/history/` | Убрать дефис, сделать nested |
| `/saved-searches/` | `/search/saved/` | Убрать дефис, сделать nested |
| `/notes/pages/{id}/comments/` | `/pages/{id}/comments/` | Упростить, убрать лишний уровень |
| `/notes/tags/` | `/tags/` | Упростить, убрать лишний уровень |
| `/notes/blocks/` | `/pages/{id}/blocks/` | Сделать nested к страницам |
| `/workspaces/invitations/` | `/workspaces/{id}/invitations/` | Сделать nested к workspace |
| `/workspaces/analytics/` | `/workspaces/{id}/analytics/` | Сделать nested к workspace |
| `/taskboards/{id}/columns/` | `/boards/{id}/columns/` | Упростить название |
| `/taskboards/{id}/tasks/` | `/boards/{id}/tasks/` | Упростить название |
| `/tasks/{id}/move/` | `/tasks/{id}/` (PATCH) | Убрать action, использовать PATCH |
| `/tasks/{id}/activity/` | `/tasks/{id}/activity/` | Оставить как есть |
| `/databases/{id}/export/` | `/databases/{id}/export/` | Оставить как есть |
| `/databases/{id}/import/` | `/databases/{id}/import/` | Оставить как есть |

## Журнал миграции

### P0 — Контракт, навигация, UI-база

#### TASK P0-00 — Бутстрап
- **Дата**: 
- **Статус**: ✅ Завершено
- **Изменения**: 
  - Создана ветка feat/redesign-p0
  - Установлен ripgrep
  - Создан SSOT master-spec.md
- **Файлы**: docs/migration/master-spec.md

#### TASK P0-10 — Унификация URL
- **Дата**: 2024-12-19
- **Статус**: ✅ Завершено
- **Изменения**: 
  - Проведена полная инвентаризация DRF URL и фронтовых API вызовов
  - Составлена таблица контрактов с текущими путями
  - Создан детальный план миграции URL с приоритетами
  - Предложены финальные RESTful пути (kebab-case, nested)
- **Файлы**: 
  - docs/migration/master-spec.md (обновлена таблица контрактов)
  - docs/migration/url-migration-plan.md (создан план миграции)

#### TASK P0-20 — OpenAPI → фронт-SDK
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

#### TASK P0-30 — Drawer/SidePanel и маршруты
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

#### TASK P0-40 — Базовый UI-kit
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

#### TASK P0-50 — Гигиена
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

### P1 — Редактор, комментарии, базы

#### TASK P1-10 — Редактор страницы
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

#### TASK P1-20 — Панель комментариев
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

#### TASK P1-30 — Базы данных: Table/Board
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

### P2 — Полировка

#### TASK P2-10 — Пустые/ошибки/скелетоны
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 

#### TASK P2-20 — Тёмная тема, перф, аналитика
- **Дата**: 
- **Статус**: ⏳ Ожидает
- **Изменения**: 
- **Файлы**: 
