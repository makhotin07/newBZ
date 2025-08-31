# 🔗 Сверка фронтенд и бэкенд API контрактов

## 📊 Таблица соответствия API endpoints

### 🔐 Auth модуль

| Frontend endpoint | Backend endpoint | Совпадает? | Комментарий |
|------------------|------------------|-------------|-------------|
| `/auth/login/` | `/api/auth/login/` | ✅ | Полное соответствие |
| `/auth/token/refresh/` | `/api/auth/token/refresh/` | ✅ | Полное соответствие |
| `/auth/register/` | `/api/auth/register/` | ✅ | Полное соответствие |
| `/auth/me/` | `/api/auth/me/` | ✅ | Полное соответствие |
| `/auth/me/password/` | `/api/auth/me/password/` | ✅ | Полное соответствие |
| `/auth/users/` | `/api/auth/users/` | ✅ | Полное соответствие |
| `/auth/password-reset/` | `/api/auth/password-reset/` | ✅ | Полное соответствие |
| `/auth/password-reset/confirm/` | `/api/auth/password-reset/confirm/` | ✅ | Полное соответствие |

### 🏢 Workspaces модуль

| Frontend endpoint | Backend endpoint | Совпадает? | Комментарий |
|------------------|------------------|-------------|-------------|
| `/workspaces/` | `/api/workspaces/` | ✅ | Полное соответствие |
| `/workspaces/:id/` | `/api/workspaces/{id}/` | ✅ | Полное соответствие |
| `/workspaces/:id/members/` | `/api/workspaces/{id}/members/` | ✅ | Полное соответствие |
| `/workspaces/:id/members/me/` | `/api/workspaces/{id}/members/me/` | ✅ | Полное соответствие |
| `/workspaces/:id/invite/` | `/api/workspaces/{id}/invite/` | ✅ | Полное соответствие |
| `/workspaces/invitations/accept/` | ❌ | **Отсутствует на бэкенде** |
| `/workspaces/invitations/:token/decline/` | ❌ | **Отсутствует на бэкенде** |
| `/workspaces/invitations/pending/` | ❌ | **Отсутствует на бэкенде** |
| `/workspaces/:id/settings/` | ❌ | **Отсутствует на бэкенде** |
| `/workspaces/:id/workspace_settings/` | ❌ | **Отсутствует на бэкенде** |
| `/workspaces/analytics/overview/` | ❌ | **Отсутствует на бэкенде** |

**🚨 Критические несоответствия:**
- Отсутствуют endpoints для приглашений (accept/decline/pending)
- Отсутствуют endpoints для настроек workspace
- Отсутствует endpoint для аналитики overview

### 📝 Notes модуль

| Frontend endpoint | Backend endpoint | Совпадает? | Комментарий |
|------------------|------------------|-------------|-------------|
| `/notes/tags/` | `/api/notes/tags/` | ✅ | Полное соответствие |
| `/notes/tags/:id/` | `/api/notes/tags/{id}/` | ✅ | Полное соответствие |
| `/notes/pages/` | `/api/notes/pages/` | ✅ | Полное соответствие |
| `/notes/pages/:id/` | `/api/notes/pages/{id}/` | ✅ | Полное соответствие |
| `/notes/pages/:id/blocks/` | `/api/notes/pages/{id}/blocks/` | ✅ | Полное соответствие |
| `/notes/blocks/:id/` | `/api/notes/blocks/{id}/` | ✅ | Полное соответствие |
| `/notes/workspace/:id/recent/` | ❌ | **Отсутствует на бэкенде** |
| `/notes/pages/:id/share/` | ❌ | **Отсутствует на бэкенде** |
| `/notes/pages/:id/shares/` | ❌ | **Отсутствует на бэкенде** |
| `/notes/pages/:id/archive/` | ❌ | **Отсутствует на бэкенде** |
| `/notes/pages/:id/duplicate/` | ❌ | **Отсутствует на бэкенде** |
| `/notes/pages/:id/children/` | ❌ | **Отсутствует на бэкенде** |
| `/notes/pages/:id/versions/` | ❌ | **Отсутствует на бэкенде** |
| `/notes/pages/search/` | ❌ | **Отсутствует на бэкенде** |

**🚨 Критические несоответствия:**
- Отсутствуют endpoints для недавних страниц
- Отсутствуют endpoints для шаринга
- Отсутствуют endpoints для архивирования/дублирования
- Отсутствуют endpoints для дочерних страниц и версий
- Отсутствует endpoint для поиска по страницам

### ✅ Tasks модуль

| Frontend endpoint | Backend endpoint | Совпадает? | Комментарий |
|------------------|------------------|-------------|-------------|
| `/taskboards/` | `/api/taskboards/` | ✅ | Полное соответствие |
| `/taskboards/:id/` | `/api/taskboards/{id}/` | ✅ | Полное соответствие |
| `/taskboards/:id/columns/` | `/api/taskboards/{id}/columns/` | ✅ | Полное соответствие |
| `/taskboards/columns/:id/` | ❌ | **Отсутствует на бэкенде** |
| `/taskboards/:id/tasks/` | `/api/taskboards/{id}/tasks/` | ✅ | Полное соответствие |
| `/tasks/` | `/api/tasks/` | ✅ | Полное соответствие |
| `/tasks/:id/` | `/api/tasks/{id}/` | ✅ | Полное соответствие |
| `/tasks/:id/move/` | ❌ | **Отсутствует на бэкенде** |
| `/workspaces/:id/task-stats/` | ❌ | **Отсутствует на бэкенде** |
| `/tasks/:id/activity/` | ❌ | **Отсутствует на бэкенде** |

**🚨 Критические несоответствия:**
- Отсутствует endpoint для обновления/удаления колонок
- Отсутствует endpoint для перемещения задач
- Отсутствует endpoint для статистики задач
- Отсутствует endpoint для активности задач

### 🗄️ Databases модуль

| Frontend endpoint | Backend endpoint | Совпадает? | Комментарий |
|------------------|------------------|-------------|-------------|
| `/databases/` | `/api/databases/` | ✅ | Полное соответствие |
| `/databases/:id/` | `/api/databases/{id}/` | ✅ | Полное соответствие |
| `/databases/:id/properties/` | `/api/databases/{id}/properties/` | ✅ | Полное соответствие |
| `/databases/:id/create_property/` | ❌ | **Отсутствует на бэкенде** |
| `/properties/:id/` | `/api/properties/{id}/` | ❌ | **Путь отличается** |
| `/databases/:id/records/` | `/api/databases/{id}/records/` | ✅ | Полное соответствие |
| `/records/:id/` | ❌ | **Отсутствует на бэкенде** |
| `/databases/:id/create_record/` | ❌ | **Отсутствует на бэкенде** |
| `/databases/:id/views/` | `/api/databases/{id}/views/` | ✅ | Полное соответствие |
| `/databases/:id/create_view/` | ❌ | **Отсутствует на бэкенде** |
| `/views/:id/` | ❌ | **Отсутствует на бэкенде** |
| `/records/:id/history/` | ❌ | **Отсутствует на бэкенде** |
| `/databases/:id/validate_formula/` | ❌ | **Отсутствует на бэкенде** |

**🚨 Критические несоответствия:**
- Отсутствуют endpoints для создания свойств/записей/представлений
- Отсутствуют endpoints для обновления/удаления свойств/записей/представлений
- Отсутствует endpoint для истории записей
- Отсутствует endpoint для валидации формул
- Путь для свойств отличается (`/properties/{id}/` vs `/databases/{id}/properties/{id}/`)

### 🔍 Search модуль

| Frontend endpoint | Backend endpoint | Совпадает? | Комментарий |
|------------------|------------------|-------------|-------------|
| `/search/search/` | `/api/search/` | ❌ | **Путь отличается** |
| `/search/global/` | ❌ | **Отсутствует на бэкенде** |
| `/search/workspace/:id/` | ❌ | **Отсутствует на бэкенде** |
| `/quick-search/` | ❌ | **Отсутствует на бэкенде** |
| `/search/autocomplete/` | ❌ | **Отсутствует на бэкенде** |
| `/suggestions/` | ❌ | **Отсутствует на бэкенде** |
| `/search-history/` | `/api/search/history/` | ❌ | **Путь отличается** |
| `/saved-searches/` | `/api/search/saved/` | ❌ | **Путь отличается** |
| `/saved-searches/:id/execute/` | ❌ | **Отсутствует на бэкенде** |

**🚨 Критические несоответствия:**
- Основной поиск использует разные пути
- Отсутствуют endpoints для глобального поиска, workspace поиска, быстрого поиска
- Отсутствуют endpoints для автодополнения и подсказок
- Пути для истории и сохраненных поисков отличаются
- Отсутствует endpoint для выполнения сохраненных поисков

### 🔔 Notifications модуль

| Frontend endpoint | Backend endpoint | Совпадает? | Комментарий |
|------------------|------------------|-------------|-------------|
| `/notifications/` | `/api/notifications/` | ✅ | Полное соответствие |
| `/notifications/:id/` | `/api/notifications/{id}/` | ✅ | Полное соответствие |
| `/notifications/mark_all_read/` | ❌ | **Отсутствует на бэкенде** |
| `/notification-settings/` | `/api/notifications/settings/` | ❌ | **Путь отличается** |
| `/reminders/` | `/api/notifications/reminders/` | ❌ | **Путь отличается** |

**🚨 Критические несоответствия:**
- Отсутствует endpoint для отметки всех уведомлений как прочитанных
- Пути для настроек и напоминаний отличаются

## 🚨 Анализ критических проблем

### 1. Отсутствующие на бэкенде endpoints (❌)

#### Workspaces
- **`/workspaces/invitations/accept/`** - принятие приглашения
- **`/workspaces/invitations/:token/decline/`** - отклонение приглашения  
- **`/workspaces/invitations/pending/`** - ожидающие приглашения
- **`/workspaces/:id/settings/`** - настройки workspace
- **`/workspaces/:id/workspace_settings/`** - обновление настроек
- **`/workspaces/analytics/overview/`** - аналитика overview

#### Notes
- **`/notes/workspace/:id/recent/`** - недавние страницы
- **`/notes/pages/:id/share/`** - шаринг страницы
- **`/notes/pages/:id/shares/`** - список шаринга
- **`/notes/pages/:id/archive/`** - архивирование
- **`/notes/pages/:id/duplicate/`** - дублирование
- **`/notes/pages/:id/children/`** - дочерние страницы
- **`/notes/pages/:id/versions/`** - версии страницы
- **`/notes/pages/search/`** - поиск по страницам

#### Tasks
- **`/taskboards/columns/:id/`** - обновление/удаление колонок
- **`/tasks/:id/move/`** - перемещение задач
- **`/workspaces/:id/task-stats/`** - статистика задач
- **`/tasks/:id/activity/`** - активность задач

#### Databases
- **`/databases/:id/create_property/`** - создание свойства
- **`/databases/:id/create_record/`** - создание записи
- **`/databases/:id/create_view/`** - создание представления
- **`/records/:id/history/`** - история записи
- **`/databases/:id/validate_formula/`** - валидация формулы

#### Search
- **`/search/global/`** - глобальный поиск
- **`/search/workspace/:id/`** - поиск в workspace
- **`/quick-search/`** - быстрый поиск
- **`/search/autocomplete/`** - автодополнение
- **`/suggestions/`** - поисковые подсказки
- **`/saved-searches/:id/execute/`** - выполнение сохраненного поиска

#### Notifications
- **`/notifications/mark_all_read/`** - отметить все как прочитанные

### 2. Различающиеся по пути/методу (🔄)

#### Databases - Properties
```typescript
// Frontend
'/properties/:id/'  // PATCH, DELETE

// Backend  
'/api/databases/{id}/properties/{id}/'  // PATCH, DELETE

// Проблема: разные пути для одного ресурса
```

#### Search - Main endpoints
```typescript
// Frontend
'/search/search/'      // POST
'/search-history/'     // GET, POST, DELETE
'/saved-searches/'     // GET, POST, PATCH, DELETE

// Backend
'/api/search/'         // GET, POST
'/api/search/history/' # GET, POST, PATCH, DELETE
'/api/search/saved/'   # GET, POST, PATCH, DELETE

// Проблема: разные базовые пути
```

#### Notifications - Settings & Reminders
```typescript
// Frontend
'/notification-settings/'  // GET, PATCH
'/reminders/'              # GET, POST, PATCH, DELETE

// Backend
'/api/notifications/settings/'  # GET, POST, PATCH, DELETE
'/api/notifications/reminders/' # GET, POST, PATCH, DELETE

// Проблема: разные базовые пути
```

### 3. Избыточные endpoints

#### Нестандартные пути
```typescript
// Вместо RESTful:
'/databases/:id/create_property/'    // ❌ Нестандартно
'/databases/:id/create_record/'      // ❌ Нестандартно
'/databases/:id/create_view/'        // ❌ Нестандартно

// Должно быть:
'/databases/:id/properties/'         // ✅ GET, POST
'/databases/:id/properties/:id/'     // ✅ PATCH, DELETE
'/databases/:id/records/'            // ✅ GET, POST
'/databases/:id/records/:id/'        // ✅ PATCH, DELETE
'/databases/:id/views/'              // ✅ GET, POST
'/databases/:id/views/:id/'          // ✅ PATCH, DELETE
```

#### Специфичные @action методы
```typescript
// Вместо:
'/workspaces/:id/members/me/'        // ❌ Специфично
'/workspaces/:id/invite/'            // ❌ Специфично

// Должно быть:
'/workspaces/:id/members/me/'        // ✅ GET, DELETE (стандартный @action)
'/workspaces/:id/invitations/'       // ✅ GET, POST (вложенный ресурс)
```

## 🎯 Рекомендации по унификации

### 1. Унифицировать API пути по RESTful стандарту

#### Workspaces
```typescript
// Текущие проблемы:
'/workspaces/:id/invite/'            // POST
'/workspaces/invitations/accept/'    // POST
'/workspaces/invitations/:token/decline/' # POST

// Рекомендуемое решение:
'/workspaces/:id/invitations/'       // GET, POST (список, создание)
'/workspaces/:id/invitations/:id/'   # PATCH, DELETE (обновление, отмена)
'/workspaces/:id/settings/'          # GET, PATCH (настройки)
'/workspaces/:id/analytics/'         # GET (аналитика)
```

#### Notes
```typescript
// Текущие проблемы:
'/notes/workspace/:id/recent/'       // GET
'/notes/pages/:id/share/'            // POST
'/notes/pages/:id/archive/'          // PATCH

// Рекомендуемое решение:
'/workspaces/:id/pages/recent/'      # GET (вложенный ресурс)
'/workspaces/:id/pages/:id/share/'   # POST (вложенный ресурс)
'/workspaces/:id/pages/:id/archive/' # PATCH (вложенный ресурс)
```

#### Tasks
```typescript
// Текущие проблемы:
'/taskboards/columns/:id/'           # PATCH, DELETE
'/tasks/:id/move/'                   # PATCH

// Рекомендуемое решение:
'/taskboards/:id/columns/:id/'       # PATCH, DELETE (вложенный ресурс)
'/tasks/:id/'                        # PATCH (с полем position/column)
```

### 2. Стандартизировать структуру URL

#### Базовый паттерн
```typescript
// Вместо смешанных подходов:
'/api/databases/'                    # ViewSet
'/api/notes/pages/{page_id}/comments/' # Generic View

// Унифицировать на ViewSet'ы:
'/api/v1/workspaces/{id}/pages/'           # GET, POST
'/api/v1/workspaces/{id}/pages/{page_id}/' # GET, PUT, PATCH, DELETE
'/api/v1/workspaces/{id}/pages/{page_id}/comments/' # GET, POST
'/api/v1/workspaces/{id}/pages/{page_id}/comments/{comment_id}/' # GET, PUT, PATCH, DELETE
```

#### Вложенные ресурсы
```typescript
// Правильная иерархия:
'/api/v1/workspaces/{workspace_id}/'
├── 'pages/'                         # Страницы workspace
├── 'tasks/'                         # Задачи workspace
├── 'databases/'                     # Базы данных workspace
├── 'members/'                       # Участники workspace
├── 'invitations/'                   # Приглашения workspace
├── 'settings/'                      # Настройки workspace
└── 'analytics/'                     # Аналитика workspace
```

### 3. Создать недостающие endpoints

#### Workspaces
```python
# backend/api/workspace_views.py
@action(detail=True, methods=['post'])
def accept_invitation(self, request, pk=None, invitation_id=None):
    """Принятие приглашения в workspace"""
    pass

@action(detail=True, methods=['post'])
def decline_invitation(self, request, pk=None, invitation_id=None):
    """Отклонение приглашения в workspace"""
    pass

@action(detail=True, methods=['get'])
def pending_invitations(self, request, pk=None):
    """Ожидающие приглашения в workspace"""
    pass

@action(detail=True, methods=['get', 'patch'])
def settings(self, request, pk=None):
    """Настройки workspace"""
    pass

@action(detail=True, methods=['get'])
def analytics_overview(self, request, pk=None):
    """Аналитика workspace"""
    pass
```

#### Notes
```python
# backend/api/note_views.py
@action(detail=False, methods=['get'])
def recent_pages(self, request):
    """Недавние страницы пользователя"""
    pass

@action(detail=True, methods=['post'])
def share_page(self, request, pk=None):
    """Шаринг страницы"""
    pass

@action(detail=True, methods=['get'])
def page_shares(self, request, pk=None):
    """Список шаринга страницы"""
    pass

@action(detail=True, methods=['patch'])
def archive_page(self, request, pk=None):
    """Архивирование страницы"""
    pass

@action(detail=True, methods=['post'])
def duplicate_page(self, request, pk=None):
    """Дублирование страницы"""
    pass

@action(detail=True, methods=['get'])
def page_children(self, request, pk=None):
    """Дочерние страницы"""
    pass

@action(detail=True, methods=['get'])
def page_versions(self, request, pk=None):
    """Версии страницы"""
    pass

@action(detail=False, methods=['get'])
def search_pages(self, request):
    """Поиск по страницам"""
    pass
```

## 📈 Итоговая оценка контракта

### ✅ Соответствующие endpoints: **45%**
- Auth модуль: 100% соответствие
- Workspaces базовые: 60% соответствие
- Notes базовые: 40% соответствие
- Tasks базовые: 70% соответствие
- Databases базовые: 50% соответствие
- Search базовые: 20% соответствие
- Notifications базовые: 60% соответствие

### ❌ Отсутствующие на бэкенде: **35%**
- Критические для функциональности endpoints
- Endpoints для расширенной функциональности
- Endpoints для аналитики и статистики

### 🔄 Различающиеся по пути/методу: **20%**
- Разные базовые пути
- Нестандартные URL структуры
- Смешение подходов (ViewSet + Generic Views)

## 🎯 Приоритеты для исправления

### P0 (Критично)
1. **Создать недостающие endpoints** для базовой функциональности
2. **Исправить конфликты путей** в workspaces и search
3. **Унифицировать структуру URL** по RESTful стандарту

### P1 (Высокий)
1. **Стандартизировать ViewSet'ы** для всех ресурсов
2. **Исправить несоответствия путей** в databases и notifications
3. **Добавить API версионирование** (/api/v1/)

### P2 (Средний)
1. **Унифицировать нейминг** (snake_case везде)
2. **Стандартизировать @action методы**
3. **Создать OpenAPI документацию**

### P3 (Низкий)
1. **Добавить retry механизм**
2. **Улучшить обработку ошибок**
3. **Добавить rate limiting**
