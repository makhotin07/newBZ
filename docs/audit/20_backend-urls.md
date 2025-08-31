# 🔗 Бэкенд URLConf и ViewSet'ы - Аудит

## 🌐 Структура URL маршрутизации

### Главные URL файлы
- **`backend/urls.py`** - корневые маршруты (admin, api)
- **`backend/api/urls.py`** - API маршруты (Clean Architecture)

### API Base URL
```
/api/ - базовый путь для всех API endpoints
```

## 📊 DRF Роутеры и ViewSet'ы

### 🗄️ Databases модуль
```python
# database_router = DefaultRouter()
# database_router.register(r"", DatabaseViewSet, basename="database")

# Результирующие URL:
/api/databases/                    # GET, POST (list, create)
/api/databases/{id}/               # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
```

**DatabaseViewSet методы:**
- `list()` - GET `/api/databases/`
- `create()` - POST `/api/databases/`
- `retrieve()` - GET `/api/databases/{id}/`
- `update()` - PUT `/api/databases/{id}/`
- `partial_update()` - PATCH `/api/databases/{id}/`
- `destroy()` - DELETE `/api/databases/{id}/`

### 💬 Comments модуль
```python
# comment_router = DefaultRouter()
# comment_router.register(r"", DatabaseCommentViewSet, basename="comment")

# Результирующие URL:
/api/comments/                     # GET, POST (list, create)
/api/comments/{id}/                # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
```

**DatabaseCommentViewSet методы:**
- `list()` - GET `/api/comments/`
- `create()` - POST `/api/comments/`
- `retrieve()` - GET `/api/comments/{id}/`
- `update()` - PUT `/api/comments/{id}/`
- `partial_update()` - PATCH `/api/comments/{id}/`
- `destroy()` - DELETE `/api/comments/{id}/`

### 📋 TaskBoard модуль
```python
# taskboard_router = DefaultRouter()
# taskboard_router.register(r"", TaskBoardViewSet, basename="taskboard")

# Результирующие URL:
/api/taskboards/                   # GET, POST (list, create)
/api/taskboards/{id}/              # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/taskboards/{id}/columns/      # GET, POST (@action columns)
/api/taskboards/{id}/tasks/        # GET, POST (@action tasks)
```

**TaskBoardViewSet методы:**
- `list()` - GET `/api/taskboards/`
- `create()` - POST `/api/taskboards/`
- `retrieve()` - GET `/api/taskboards/{id}/`
- `update()` - PUT `/api/taskboards/{id}/`
- `partial_update()` - PATCH `/api/taskboards/{id}/`
- `destroy()` - DELETE `/api/taskboards/{id}/`
- `@action columns` - GET, POST `/api/taskboards/{id}/columns/`
- `@action tasks` - GET, POST `/api/taskboards/{id}/tasks/`

### ✅ Tasks модуль
```python
# task_router = DefaultRouter()
# task_router.register(r"", TaskViewSet, basename="task")

# Результирующие URL:
/api/tasks/                        # GET, POST (list, create)
/api/tasks/{id}/                   # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
```

**TaskViewSet методы:**
- `list()` - GET `/api/tasks/`
- `create()` - POST `/api/tasks/`
- `retrieve()` - GET `/api/tasks/{id}/`
- `update()` - PUT `/api/tasks/{id}/`
- `partial_update()` - PATCH `/api/tasks/{id}/`
- `destroy()` - DELETE `/api/tasks/{id}/`

### 📝 Notes модуль
```python
# note_router = DefaultRouter()
# note_router.register(r"pages", PageViewSet, basename="page")
# note_router.register(r"tags", TagViewSet, basename="tag")
# note_router.register(r"blocks", BlockViewSet, basename="block")

# Результирующие URL:
/api/notes/pages/                  # GET, POST (list, create)
/api/notes/pages/{id}/             # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/notes/pages/{id}/blocks/      # GET, POST (@action blocks)
/api/notes/tags/                   # GET, POST (list, create)
/api/notes/tags/{id}/              # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/notes/blocks/                 # GET, POST (list, create)
/api/notes/blocks/{id}/            # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
```

**PageViewSet методы:**
- `list()` - GET `/api/notes/pages/`
- `create()` - POST `/api/notes/pages/`
- `retrieve()` - GET `/api/notes/pages/{id}/`
- `update()` - PUT `/api/notes/pages/{id}/`
- `partial_update()` - PATCH `/api/notes/pages/{id}/`
- `destroy()` - DELETE `/api/notes/pages/{id}/`
- `@action blocks` - GET, POST `/api/notes/pages/{id}/blocks/`

**TagViewSet методы:**
- `list()` - GET `/api/notes/tags/`
- `create()` - POST `/api/notes/tags/`
- `retrieve()` - GET `/api/notes/tags/{id}/`
- `update()` - PUT `/api/notes/tags/{id}/`
- `partial_update()` - PATCH `/api/notes/tags/{id}/`
- `destroy()` - DELETE `/api/notes/tags/{id}/`

**BlockViewSet методы:**
- `list()` - GET `/api/notes/blocks/`
- `create()` - POST `/api/notes/blocks/`
- `retrieve()` - GET `/api/notes/blocks/{id}/`
- `update()` - PUT `/api/notes/blocks/{id}/`
- `partial_update()` - PATCH `/api/notes/blocks/{id}/`
- `destroy()` - DELETE `/api/notes/blocks/{id}/`

### 🏢 Workspaces модуль
```python
# workspace_router = DefaultRouter()
# workspace_router.register(r"", WorkspaceViewSet, basename="workspace")

# Результирующие URL:
/api/workspaces/                   # GET, POST (list, create)
/api/workspaces/{id}/              # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/workspaces/{id}/members/      # GET (@action members)
/api/workspaces/{id}/members/me/   # GET, DELETE (@action me, leave)
/api/workspaces/{id}/invite/       # POST (@action invite)
```

**WorkspaceViewSet методы:**
- `list()` - GET `/api/workspaces/`
- `create()` - POST `/api/workspaces/`
- `retrieve()` - GET `/api/workspaces/{id}/`
- `update()` - PUT `/api/workspaces/{id}/`
- `partial_update()` - PATCH `/api/workspaces/{id}/`
- `destroy()` - DELETE `/api/workspaces/{id}/`
- `@action members` - GET `/api/workspaces/{id}/members/`
- `@action me` - GET `/api/workspaces/{id}/members/me/`
- `@action leave` - DELETE `/api/workspaces/{id}/members/me/`
- `@action invite` - POST `/api/workspaces/{id}/invite/`

### 📊 Workspace Analytics модуль
```python
# analytics_router = DefaultRouter()
# analytics_router.register(r"", WorkspaceAnalyticsViewSet, basename="workspace-analytics")

# Результирующие URL:
/api/workspaces/analytics/         # GET, POST (list, create)
/api/workspaces/analytics/{id}/    # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
```

**WorkspaceAnalyticsViewSet методы:**
- `list()` - GET `/api/workspaces/analytics/`
- `create()` - POST `/api/workspaces/analytics/`
- `retrieve()` - GET `/api/workspaces/analytics/{id}/`
- `update()` - PUT `/api/workspaces/analytics/{id}/`
- `partial_update()` - PATCH `/api/workspaces/analytics/{id}/`
- `destroy()` - DELETE `/api/workspaces/analytics/{id}/`

### 🔍 Search модуль
```python
# search_router = DefaultRouter()
# search_router.register(r"", SearchViewSet, basename="search")
# search_router.register(r"history", SearchHistoryViewSet, basename="searchhistory")
# search_router.register(r"saved", SavedSearchViewSet, basename="savedsearch")

# Результирующие URL:
/api/search/                       # GET, POST (list, create)
/api/search/{id}/                  # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/search/history/               # GET, POST (list, create)
/api/search/history/{id}/          # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/search/saved/                 # GET, POST (list, create)
/api/search/saved/{id}/            # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
```

**SearchViewSet методы:**
- `list()` - GET `/api/search/`
- `create()` - POST `/api/search/`
- `retrieve()` - GET `/api/search/{id}/`
- `update()` - PUT `/api/search/{id}/`
- `partial_update()` - PATCH `/api/search/{id}/`
- `destroy()` - DELETE `/api/search/{id}/`

**SearchHistoryViewSet методы:**
- `list()` - GET `/api/search/history/`
- `create()` - POST `/api/search/history/`
- `retrieve()` - GET `/api/search/history/{id}/`
- `update()` - PUT `/api/search/history/{id}/`
- `partial_update()` - PATCH `/api/search/history/{id}/`
- `destroy()` - DELETE `/api/search/history/{id}/`

**SavedSearchViewSet методы:**
- `list()` - GET `/api/search/saved/`
- `create()` - POST `/api/search/saved/`
- `retrieve()` - GET `/api/search/saved/{id}/`
- `update()` - PUT `/api/search/saved/{id}/`
- `partial_update()` - PATCH `/api/search/saved/{id}/`
- `destroy()` - DELETE `/api/search/saved/{id}/`

### 🔔 Notifications модуль
```python
# notifications_router = DefaultRouter()
# notifications_router.register(r"", NotificationViewSet, basename="notification")
# notifications_router.register(r"settings", NotificationSettingsViewSet, basename="notificationsettings")
# notifications_router.register(r"reminders", ReminderViewSet, basename="reminder")

# Результирующие URL:
/api/notifications/                # GET, POST (list, create)
/api/notifications/{id}/           # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/notifications/settings/       # GET, POST (list, create)
/api/notifications/settings/{id}/  # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
/api/notifications/reminders/      # GET, POST (list, create)
/api/notifications/reminders/{id}/ # GET, PUT, PATCH, DELETE (retrieve, update, partial_update, destroy)
```

**NotificationViewSet методы:**
- `list()` - GET `/api/notifications/`
- `create()` - POST `/api/notifications/`
- `retrieve()` - GET `/api/notifications/{id}/`
- `update()` - PUT `/api/notifications/{id}/`
- `partial_update()` - PATCH `/api/notifications/{id}/`
- `destroy()` - DELETE `/api/notifications/{id}/`

**NotificationSettingsViewSet методы:**
- `list()` - GET `/api/notifications/settings/`
- `create()` - POST `/api/notifications/settings/`
- `retrieve()` - GET `/api/notifications/settings/{id}/`
- `update()` - PUT `/api/notifications/settings/{id}/`
- `partial_update()` - PATCH `/api/notifications/settings/{id}/`
- `destroy()` - DELETE `/api/notifications/settings/{id}/`

**ReminderViewSet методы:**
- `list()` - GET `/api/notifications/reminders/`
- `create()` - POST `/api/notifications/reminders/`
- `retrieve()` - GET `/api/notifications/reminders/{id}/`
- `update()` - PUT `/api/notifications/reminders/{id}/`
- `partial_update()` - PATCH `/api/notifications/reminders/{id}/`
- `destroy()` - DELETE `/api/notifications/reminders/{id}/`

## 🔐 Auth модуль (Function-based views)

```python
# Стандартные Django views (не ViewSet'ы)
/api/auth/login/                   # POST (CustomTokenObtainPairView)
/api/auth/token/refresh/           # POST (TokenRefreshView)
/api/auth/register/                # POST (UserRegistrationView)
/api/auth/me/                      # GET (UserProfileView)
/api/auth/me/password/             # POST (change_password)
/api/auth/users/                   # GET (UserListView)
/api/auth/password-reset/          # POST (forgot_password)
/api/auth/password-reset/confirm/  # POST (reset_password)
```

## 💬 Page Comments (Generic Views)

```python
# Стандартные Django REST generic views
/api/notes/pages/{page_id}/comments/           # GET, POST (PageCommentsListView)
/api/notes/pages/{page_id}/comments/{pk}/      # GET, PUT, PATCH, DELETE (PageCommentDetailView)
/api/notes/pages/{page_id}/comments/{pk}/resolve/ # POST (PageCommentResolveView)
```

## 🌐 WebSocket (Channels)

### URL паттерны
```python
# backend/apps/collaboration/routing.py
/ws/test/                                                          # Тестовый WebSocket
/ws/collab/{workspace_id}/{resource_type}/{resource_id}/           # Совместная работа
/ws/database/{database_id}/                                         # Real-time обновления БД
/ws/notifications/                                                  # Уведомления пользователя
```

### Consumers
- **`TestConsumer`** - тестовый WebSocket для отладки
- **`CollaborationConsumer`** - совместная работа над ресурсами
- **`DatabaseCollaborationConsumer`** - real-time обновления базы данных
- **`NotificationConsumer`** - уведомления пользователя

## ⚡ Celery задачи

### Модули с Celery задачами
```python
# backend/services/ - все сервисы могут содержать Celery задачи
- account_service.py
- collaboration_service.py
- databases.py
- note_service.py
- search_service.py
- taskboards.py
- workspace_service.py
```

## 📊 Единая таблица Backend URL

| Backend URL | HTTP методы | ViewSet/View | Модуль/файл | Описание |
|-------------|-------------|--------------|-------------|----------|
| `/api/databases/` | GET, POST | DatabaseViewSet | `backend/api/database_views.py` | CRUD базы данных |
| `/api/databases/{id}/` | GET, PUT, PATCH, DELETE | DatabaseViewSet | `backend/api/database_views.py` | CRUD базы данных |
| `/api/comments/` | GET, POST | DatabaseCommentViewSet | `backend/api/database_views.py` | CRUD комментариев |
| `/api/comments/{id}/` | GET, PUT, PATCH, DELETE | DatabaseCommentViewSet | `backend/api/database_views.py` | CRUD комментариев |
| `/api/taskboards/` | GET, POST | TaskBoardViewSet | `backend/api/taskboard_views.py` | CRUD досок задач |
| `/api/taskboards/{id}/` | GET, PUT, PATCH, DELETE | TaskBoardViewSet | `backend/api/taskboard_views.py` | CRUD досок задач |
| `/api/taskboards/{id}/columns/` | GET, POST | TaskBoardViewSet.@action | `backend/api/taskboard_views.py` | Управление колонками |
| `/api/taskboards/{id}/tasks/` | GET, POST | TaskBoardViewSet.@action | `backend/api/taskboard_views.py` | Управление задачами |
| `/api/tasks/` | GET, POST | TaskViewSet | `backend/api/taskboard_views.py` | CRUD задач |
| `/api/tasks/{id}/` | GET, PUT, PATCH, DELETE | TaskViewSet | `backend/api/taskboard_views.py` | CRUD задач |
| `/api/notes/pages/` | GET, POST | PageViewSet | `backend/api/note_views.py` | CRUD страниц |
| `/api/notes/pages/{id}/` | GET, PUT, PATCH, DELETE | PageViewSet | `backend/api/note_views.py` | CRUD страниц |
| `/api/notes/pages/{id}/blocks/` | GET, POST | PageViewSet.@action | `backend/api/note_views.py` | Управление блоками |
| `/api/notes/tags/` | GET, POST | TagViewSet | `backend/api/note_views.py` | CRUD тегов |
| `/api/notes/tags/{id}/` | GET, PUT, PATCH, DELETE | TagViewSet | `backend/api/note_views.py` | CRUD тегов |
| `/api/notes/blocks/` | GET, POST | BlockViewSet | `backend/api/note_views.py` | CRUD блоков |
| `/api/notes/blocks/{id}/` | GET, PUT, PATCH, DELETE | BlockViewSet | `backend/api/note_views.py` | CRUD блоков |
| `/api/notes/pages/{page_id}/comments/` | GET, POST | PageCommentsListView | `backend/api/note_views.py` | Список комментариев |
| `/api/notes/pages/{page_id}/comments/{pk}/` | GET, PUT, PATCH, DELETE | PageCommentDetailView | `backend/api/note_views.py` | CRUD комментария |
| `/api/notes/pages/{page_id}/comments/{pk}/resolve/` | POST | PageCommentResolveView | `backend/api/note_views.py` | Разрешение комментария |
| `/api/workspaces/` | GET, POST | WorkspaceViewSet | `backend/api/workspace_views.py` | CRUD рабочих пространств |
| `/api/workspaces/{id}/` | GET, PUT, PATCH, DELETE | WorkspaceViewSet | `backend/api/workspace_views.py` | CRUD рабочих пространств |
| `/api/workspaces/{id}/members/` | GET | WorkspaceViewSet.@action | `backend/api/workspace_views.py` | Участники workspace |
| `/api/workspaces/{id}/members/me/` | GET, DELETE | WorkspaceViewSet.@action | `backend/api/workspace_views.py` | Текущий участник/выход |
| `/api/workspaces/{id}/invite/` | POST | WorkspaceViewSet.@action | `backend/api/workspace_views.py` | Приглашение пользователя |
| `/api/workspaces/invitations/` | GET, POST | WorkspaceInvitationViewSet | `backend/api/workspace_views.py` | CRUD приглашений |
| `/api/workspaces/invitations/{id}/` | GET, PUT, PATCH, DELETE | WorkspaceInvitationViewSet | `backend/api/workspace_views.py` | CRUD приглашений |
| `/api/workspaces/analytics/` | GET, POST | WorkspaceAnalyticsViewSet | `backend/api/workspace_analytics_views.py` | CRUD аналитики |
| `/api/workspaces/analytics/{id}/` | GET, PUT, PATCH, DELETE | WorkspaceAnalyticsViewSet | `backend/api/workspace_analytics_views.py` | CRUD аналитики |
| `/api/search/` | GET, POST | SearchViewSet | `backend/api/search_views.py` | CRUD поиска |
| `/api/search/{id}/` | GET, PUT, PATCH, DELETE | SearchViewSet | `backend/api/search_views.py` | CRUD поиска |
| `/api/search/history/` | GET, POST | SearchHistoryViewSet | `backend/api/search_views.py` | CRUD истории поиска |
| `/api/search/history/{id}/` | GET, PUT, PATCH, DELETE | SearchHistoryViewSet | `backend/api/search_views.py` | CRUD истории поиска |
| `/api/search/saved/` | GET, POST | SavedSearchViewSet | `backend/api/search_views.py` | CRUD сохраненных поисков |
| `/api/search/saved/{id}/` | GET, PUT, PATCH, DELETE | SavedSearchViewSet | `backend/api/search_views.py` | CRUD сохраненных поисков |
| `/api/notifications/` | GET, POST | NotificationViewSet | `backend/apps/notifications/views.py` | CRUD уведомлений |
| `/api/notifications/{id}/` | GET, PUT, PATCH, DELETE | NotificationViewSet | `backend/apps/notifications/views.py` | CRUD уведомлений |
| `/api/notifications/settings/` | GET, POST | NotificationSettingsViewSet | `backend/apps/notifications/views.py` | CRUD настроек уведомлений |
| `/api/notifications/settings/{id}/` | GET, PUT, PATCH, DELETE | NotificationSettingsViewSet | `backend/apps/notifications/views.py` | CRUD настроек уведомлений |
| `/api/notifications/reminders/` | GET, POST | ReminderViewSet | `backend/apps/notifications/views.py` | CRUD напоминаний |
| `/api/notifications/reminders/{id}/` | GET, PUT, PATCH, DELETE | ReminderViewSet | `backend/apps/notifications/views.py` | CRUD напоминаний |
| `/api/auth/login/` | POST | CustomTokenObtainPairView | `backend/api/account_views.py` | Аутентификация |
| `/api/auth/token/refresh/` | POST | TokenRefreshView | `rest_framework_simplejwt.views` | Обновление токена |
| `/api/auth/register/` | POST | UserRegistrationView | `backend/api/account_views.py` | Регистрация |
| `/api/auth/me/` | GET | UserProfileView | `backend/api/account_views.py` | Профиль пользователя |
| `/api/auth/me/password/` | POST | change_password | `backend/api/account_views.py` | Изменение пароля |
| `/api/auth/users/` | GET | UserListView | `backend/api/account_views.py` | Список пользователей |
| `/api/auth/password-reset/` | POST | forgot_password | `backend/api/account_views.py` | Сброс пароля |
| `/api/auth/password-reset/confirm/` | POST | reset_password | `backend/api/account_views.py` | Подтверждение сброса |

## 🚨 Потенциальные проблемы

### 1. Конфликты путей

#### Проблема с workspaces
```python
# Потенциальный конфликт:
/api/workspaces/{id}/              # WorkspaceViewSet
/api/workspaces/invitations/       # WorkspaceInvitationViewSet

# Проблема: {id} может перехватить "invitations"
# Решение: изменить порядок или использовать более специфичные пути
```

#### Проблема с search
```python
# Потенциальный конфликт:
/api/search/{id}/                  # SearchViewSet
/api/search/history/               # SearchHistoryViewSet
/api/search/saved/                 # SavedSearchViewSet

# Проблема: {id} может перехватить "history" и "saved"
# Решение: изменить порядок или использовать более специфичные пути
```

### 2. Различия в нейминге

#### Смешение snake_case и kebab-case
```python
# Snake_case в URL:
/api/workspaces/invitations/       # ✅ Правильно
/api/workspaces/analytics/         # ✅ Правильно

# Kebab-case в basename:
basename="workspace-invitation"    # ❌ Неправильно
basename="workspace-analytics"     # ❌ Неправильно

# Рекомендация: унифицировать на snake_case
```

#### Нестандартные @action методы
```python
# Хорошие @action:
@action(detail=True, methods=['get', 'post'])
def blocks(self, request, pk=None):

# Проблемные @action (слишком специфичные):
@action(detail=True, methods=['delete'], url_path="members/me")
def leave(self, request, pk=None):

# Рекомендация: использовать стандартные RESTful пути
```

### 3. Архитектурные проблемы

#### Смешение ViewSet'ов и Generic Views
```python
# ViewSet'ы:
PageViewSet, TagViewSet, BlockViewSet

# Generic Views:
PageCommentsListView, PageCommentDetailView, PageCommentResolveView

# Проблема: разные подходы для похожих ресурсов
# Рекомендация: унифицировать на ViewSet'ы
```

#### Отсутствие API версионирования
```python
# Текущий путь:
/api/databases/

# Рекомендуемый путь:
/api/v1/databases/
/api/v2/databases/
```

## 🎯 Рекомендации для редизайна

### 1. Унифицировать URL структуру
```python
# Стандартный RESTful паттерн:
/api/v1/workspaces/{id}/pages/           # GET, POST
/api/v1/workspaces/{id}/pages/{page_id}/ # GET, PUT, PATCH, DELETE
/api/v1/workspaces/{id}/tasks/           # GET, POST
/api/v1/workspaces/{id}/tasks/{task_id}/ # GET, PUT, PATCH, DELETE
```

### 2. Исправить конфликты путей
```python
# Изменить порядок в urlpatterns:
path("workspaces/invitations/", ...),     # Сначала специфичные
path("workspaces/analytics/", ...),       # Потом специфичные
path("workspaces/", include(...)),        # Потом общие
```

### 3. Стандартизировать @action методы
```python
# Вместо:
@action(detail=True, methods=['delete'], url_path="members/me")
def leave(self, request, pk=None):

# Использовать:
@action(detail=True, methods=['delete'])
def leave_workspace(self, request, pk=None):
    # URL будет: /api/workspaces/{id}/leave_workspace/
```

### 4. Добавить API версионирование
```python
# В backend/api/urls.py:
urlpatterns = [
    path('v1/', include([
        # Все текущие URL
    ])),
    path('v2/', include([
        # Новые версии API
    ])),
]
```

## 📈 Итоговая оценка

### ✅ Сильные стороны
- **Хорошая структура** с разделением по модулям
- **Использование ViewSet'ов** для стандартных CRUD операций
- **@action методы** для специфичных операций
- **WebSocket поддержка** через Channels
- **Clean Architecture** с разделением на сервисы

### ⚠️ Области для улучшения
- **Конфликты путей** между общими и специфичными маршрутами
- **Смешение подходов** (ViewSet'ы + Generic Views)
- **Отсутствие API версионирования**
- **Нестандартные @action методы** с кастомными URL

### 🎯 Приоритеты для редизайна
1. **Высокий** - Исправить конфликты путей
2. **Высокий** - Унифицировать на ViewSet'ы
3. **Средний** - Добавить API версионирование
4. **Средний** - Стандартизировать @action методы
5. **Низкий** - Унифицировать нейминг (snake_case)
6. **Долгосрочный** - Создать OpenAPI документацию
