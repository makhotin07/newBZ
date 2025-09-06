# API-слой и связь с бэкендом

## Обзор API архитектуры

### Бэкенд (Django/DRF)
- **Базовый URL**: `/api/`
- **Аутентификация**: JWT токены (SimpleJWT)
- **Документация**: OpenAPI/Swagger (`/api/schema/`)
- **Архитектура**: Clean Architecture с ViewSets

### Фронтенд (React)
- **HTTP клиент**: Axios
- **Базовый URL**: `http://localhost:8000/api` (dev), `/api` (prod)
- **Аутентификация**: Bearer токены в заголовках
- **Управление состоянием**: React Query

## Сопоставление эндпоинтов

### ✅ Работающие эндпоинты

| Фронтенд | Бэкенд | Метод | Описание | Статус |
|----------|--------|-------|----------|--------|
| `/auth/login/` | `/api/auth/login/` | POST | Вход | ✅ |
| `/auth/token/refresh/` | `/api/auth/token/refresh/` | POST | Обновление токена | ✅ |
| `/auth/register/` | `/api/auth/register/` | POST | Регистрация | ✅ |
| `/auth/me/` | `/api/auth/me/` | GET | Профиль пользователя | ✅ |
| `/auth/me/password/` | `/api/auth/me/password/` | PATCH | Смена пароля | ✅ |
| `/workspaces/` | `/api/workspaces/` | GET/POST | Список/создание workspace | ✅ |
| `/workspaces/{id}/` | `/api/workspaces/{id}/` | GET/PATCH/DELETE | CRUD workspace | ✅ |
| `/workspaces/{id}/members/` | `/api/workspaces/{id}/members/` | GET | Участники workspace | ✅ |
| `/workspaces/{id}/invite/` | `/api/workspaces/{id}/invite/` | POST | Приглашение пользователя | ✅ |
| `/databases/` | `/api/databases/` | GET/POST | Список/создание БД | ✅ |
| `/databases/{id}/` | `/api/databases/{id}/` | GET/PATCH/DELETE | CRUD БД | ✅ |
| `/databases/{id}/records/` | `/api/databases/{id}/records/` | GET/POST | Записи БД | ✅ |
| `/taskboards/` | `/api/taskboards/` | GET/POST | Список/создание досок | ✅ |
| `/taskboards/{id}/` | `/api/taskboards/{id}/` | GET/PATCH/DELETE | CRUD досок | ✅ |
| `/tasks/` | `/api/tasks/` | GET/POST | Список/создание задач | ✅ |
| `/tasks/{id}/` | `/api/tasks/{id}/` | GET/PATCH/DELETE | CRUD задач | ✅ |
| `/notes/pages/` | `/api/notes/pages/` | GET/POST | Список/создание страниц | ✅ |
| `/notes/pages/{id}/` | `/api/notes/pages/{id}/` | GET/PATCH/DELETE | CRUD страниц | ✅ |
| `/search/search/` | `/api/search/search/` | POST | Поиск | ✅ |

### ❌ Проблемные эндпоинты

| Фронтенд | Бэкенд | Проблема | Статус |
|----------|--------|----------|--------|
| `/notes/pages/{id}/comments/` | `/api/notes/pages/{id}/comments/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/databases/{id}/properties/` | `/api/databases/{id}/properties/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/databases/{id}/create_property/` | `/api/databases/{id}/create_property/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/properties/{id}/` | `/api/properties/{id}/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/records/{id}/` | `/api/records/{id}/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/databases/{id}/create_record/` | `/api/databases/{id}/create_record/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/databases/{id}/views/` | `/api/databases/{id}/views/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/views/{id}/` | `/api/views/{id}/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/taskboards/{id}/columns/` | `/api/taskboards/{id}/columns/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/taskboards/columns/{id}/` | `/api/taskboards/columns/{id}/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/tasks/{id}/move/` | `/api/tasks/{id}/move/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/tasks/{id}/activity/` | `/api/tasks/{id}/activity/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/workspaces/{id}/task-stats/` | `/api/workspaces/{id}/task-stats/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/search/global/` | `/api/search/global/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/search/workspace/{id}/` | `/api/search/workspace/{id}/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/search/autocomplete/` | `/api/search/autocomplete/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/quick-search/` | `/api/quick-search/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/suggestions/` | `/api/suggestions/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/search-history/` | `/api/search-history/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |
| `/saved-searches/` | `/api/saved-searches/` | **НЕ НАЙДЕНО** в бэкенде | ❌ |

### ⚠️ Частично работающие эндпоинты

| Фронтенд | Бэкенд | Проблема | Статус |
|----------|--------|----------|--------|
| `/notes/tags/` | `/api/notes/tags/` | Есть в бэкенде, но фронт использует заглушки | ⚠️ |
| `/notes/blocks/` | `/api/notes/blocks/` | Есть в бэкенде, но фронт использует заглушки | ⚠️ |
| `/comments/` | `/api/comments/` | Есть в бэкенде, но фронт использует заглушки | ⚠️ |
| `/notifications/` | `/api/notifications/` | Есть в бэкенде, но фронт использует заглушки | ⚠️ |

## Проблемы в коде

### 1. Синтаксические ошибки

#### `backend/api/urls.py` (строки 88-89, 129)
```python
# Ошибка: отсутствует ViewSet
notifications_router.register(
    r"settings",
    ,  # ← ОШИБКА: пустой параметр
    basename="notificationsettings",
)

# Ошибка: незавершенный path
path("auth/register/",  # ← ОШИБКА: отсутствует ViewSet
```

#### `frontend/src/features/databases/api.ts` (строки 57, 88)
```typescript
// Ошибка: отсутствует запятая
deleteRecord: (recordId: string) => 
  api.delete(`/records/${recordId}/`)  // ← ОШИБКА: нет запятой

// Ошибка: незавершенный объект
validateFormula: (expression: string, databaseId: string) => 
  api.post<{ valid: boolean; error?: string; dependencies?: string[] }>(`/databases/${databaseId}/validate_formula/`, {
    expression
  },  // ← ОШИБКА: лишняя запятая
};
```

#### `frontend/src/features/search/api.ts` (строки 156, 204)
```typescript
// Ошибка: незавершенная функция
getSearchHistory:  // ← ОШИБКА: отсутствует тело функции
  const response = await api.get('/search-history/', {
    params: { workspace_id },
  });
  return response.data;
},

// Ошибка: лишняя запятая
executeSavedSearch: async (id: string, page?: number, page_size?: number): Promise<SearchResponse> => {
  const response = await api.post(`/saved-searches/${id}/execute/`, {}, {
    params: { page, page_size },
  });
  return response.data;
},  // ← ОШИБКА: лишняя запятая
};
```

### 2. Заглушки вместо реальных API

#### `frontend/src/features/notes/api.ts`
```typescript
// ВСЕ МЕТОДЫ - ЗАГЛУШКИ
export const notesApi = {
  getTags: async () => {
    return { results: [] };  // ← ЗАГЛУШКА
  },
  
  getPage: async (id: string) => {
    return {
      id,
      title: 'Заглушка',  // ← ЗАГЛУШКА
      content: '',
      // ... остальные поля - заглушки
    };
  },
  
  // ... все остальные методы - заглушки
};
```

### 3. Несоответствия в типах данных

#### Workspace API
- **Фронтенд ожидает**: `workspace_id` в параметрах
- **Бэкенд предоставляет**: `workspace` в URL path

#### Database API
- **Фронтенд ожидает**: `/databases/{id}/properties/`
- **Бэкенд предоставляет**: только `/databases/{id}/` (ViewSet)

#### Task API
- **Фронтенд ожидает**: `/taskboards/{id}/columns/`
- **Бэкенд предоставляет**: только `/taskboards/{id}/` (ViewSet)

## Анализ покрытия API

### Бэкенд → Фронтенд (неиспользуемые эндпоинты)

| Бэкенд эндпоинт | Описание | Используется фронтом |
|-----------------|----------|---------------------|
| `/api/notes/tags/` | Управление тегами | ❌ (заглушки) |
| `/api/notes/blocks/` | Управление блоками | ❌ (заглушки) |
| `/api/comments/` | Комментарии к БД | ❌ (заглушки) |
| `/api/notifications/` | Уведомления | ❌ (заглушки) |
| `/api/search/search/` | Поиск | ❌ (заглушки) |
| `/api/workspaces/analytics/` | Аналитика | ❌ (заглушки) |

### Фронтенд → Бэкенд (отсутствующие эндпоинты)

| Фронтенд эндпоинт | Описание | Есть в бэкенде |
|-------------------|----------|----------------|
| `/databases/{id}/properties/` | Свойства БД | ❌ |
| `/databases/{id}/create_property/` | Создание свойства | ❌ |
| `/properties/{id}/` | CRUD свойств | ❌ |
| `/records/{id}/` | CRUD записей | ❌ |
| `/databases/{id}/create_record/` | Создание записи | ❌ |
| `/databases/{id}/views/` | Представления БД | ❌ |
| `/taskboards/{id}/columns/` | Колонки досок | ❌ |
| `/tasks/{id}/move/` | Перемещение задач | ❌ |
| `/search/global/` | Глобальный поиск | ❌ |
| `/search/autocomplete/` | Автодополнение | ❌ |

## Рекомендации по исправлению

### 1. Критичные исправления (P0)

1. **Исправить синтаксические ошибки**:
   - `backend/api/urls.py` - завершить регистрацию ViewSets
   - `frontend/src/features/databases/api.ts` - исправить запятые
   - `frontend/src/features/search/api.ts` - завершить функции

2. **Заменить заглушки на реальные API**:
   - `frontend/src/features/notes/api.ts` - все методы
   - `frontend/src/features/search/api.ts` - все методы
   - `frontend/src/features/notifications/api.ts` - все методы

### 2. Важные исправления (P1)

1. **Добавить отсутствующие эндпоинты в бэкенд**:
   - Свойства БД (`/databases/{id}/properties/`)
   - Записи БД (`/records/{id}/`)
   - Колонки досок (`/taskboards/{id}/columns/`)
   - Поиск (`/search/global/`, `/search/autocomplete/`)

2. **Исправить несоответствия в типах**:
   - Унифицировать параметры workspace
   - Синхронизировать структуры данных

### 3. Улучшения (P2)

1. **Добавить валидацию**:
   - Проверка существования эндпоинтов
   - Валидация типов данных
   - Обработка ошибок API

2. **Улучшить документацию**:
   - OpenAPI схема для всех эндпоинтов
   - Примеры запросов/ответов
   - Описание ошибок

## Состояние реализации

| Модуль | Фронтенд | Бэкенд | Соответствие |
|--------|----------|--------|--------------|
| Auth | ✅ Готов | ✅ Готов | ✅ 100% |
| Workspaces | ✅ Готов | ✅ Готов | ✅ 100% |
| Databases | ⚠️ Частично | ⚠️ Частично | ❌ 40% |
| Tasks | ⚠️ Частично | ⚠️ Частично | ❌ 60% |
| Notes | ❌ Заглушки | ✅ Готов | ❌ 20% |
| Search | ❌ Заглушки | ⚠️ Частично | ❌ 30% |
| Comments | ❌ Заглушки | ✅ Готов | ❌ 10% |
| Notifications | ❌ Заглушки | ✅ Готов | ❌ 10% |

**Общая оценка**: 46% готовности (много заглушек и отсутствующих эндпоинтов)
