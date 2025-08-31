# 🌐 Фронтенд API-вызовы - Аудит

## 🔧 Базовый API клиент

### Конфигурация axios
```typescript
// shared/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Interceptors
- ✅ **Request interceptor** - автоматическое добавление JWT токена
- ✅ **Response interceptor** - автоматическое обновление токена при 401
- ✅ **Error handling** - редирект на /login при истечении токенов

## 📊 Таблица API endpoints

### 🔐 Auth модуль

| Frontend endpoint | Метод | Где вызывается | Описание |
|------------------|-------|----------------|----------|
| `/auth/login/` | POST | `features/auth/api.ts` | Аутентификация пользователя |
| `/auth/token/refresh/` | POST | `shared/api.ts` | Обновление access токена |
| `/auth/register/` | POST | `features/auth/api.ts` | Регистрация пользователя |
| `/auth/me/` | GET | `features/auth/api.ts` | Получение профиля пользователя |
| `/auth/me/password/` | PATCH | `features/auth/api.ts` | Изменение пароля |
| `/auth/users/` | GET | `features/workspaces/api.ts` | Поиск пользователей для приглашений |
| `/auth/password-reset/` | POST | `features/auth/api.ts` | Запрос сброса пароля |
| `/auth/password-reset/confirm/` | POST | `features/auth/api.ts` | Подтверждение сброса пароля |

### 🏢 Workspaces модуль

| Frontend endpoint | Метод | Где вызывается | Описание |
|------------------|-------|----------------|----------|
| `/workspaces/` | GET | `features/workspaces/api.ts` | Список рабочих пространств |
| `/workspaces/:id/` | GET | `features/workspaces/api.ts` | Получение workspace |
| `/workspaces/` | POST | `features/workspaces/api.ts` | Создание workspace |
| `/workspaces/:id/` | PATCH | `features/workspaces/api.ts` | Обновление workspace |
| `/workspaces/:id/` | DELETE | `features/workspaces/api.ts` | Удаление workspace |
| `/workspaces/:id/members/` | GET | `features/workspaces/api.ts` | Участники workspace |
| `/workspaces/:id/members/me/` | GET | `features/workspaces/api.ts` | Текущий участник |
| `/workspaces/:id/members/:memberId/` | PATCH | `features/workspaces/api.ts` | Обновление роли участника |
| `/workspaces/:id/members/:memberId/` | DELETE | `features/workspaces/api.ts` | Удаление участника |
| `/workspaces/:id/invite/` | POST | `features/workspaces/api.ts` | Приглашение пользователя |
| `/workspaces/invitations/accept/` | POST | `features/workspaces/api.ts` | Принятие приглашения |
| `/workspaces/invitations/:token/decline/` | POST | `features/workspaces/api.ts` | Отклонение приглашения |
| `/workspaces/invitations/pending/` | GET | `features/workspaces/api.ts` | Ожидающие приглашения |
| `/workspaces/:id/settings/` | GET | `features/workspaces/api.ts` | Настройки workspace |
| `/workspaces/:id/workspace_settings/` | PATCH | `features/workspaces/api.ts` | Обновление настроек |
| `/workspaces/analytics/overview/` | GET | `features/workspaces/api.ts` | Аналитика workspace |

### 📝 Notes модуль

| Frontend endpoint | Метод | Где вызывается | Описание |
|------------------|-------|----------------|----------|
| `/notes/tags/` | GET | `features/notes/api.ts` | Список тегов |
| `/notes/tags/` | POST | `features/notes/api.ts` | Создание тега |
| `/notes/tags/:id/` | PATCH | `features/notes/api.ts` | Обновление тега |
| `/notes/tags/:id/` | DELETE | `features/notes/api.ts` | Удаление тега |
| `/notes/pages/` | GET | `features/notes/api.ts` | Список страниц |
| `/notes/pages/:id/` | GET | `features/notes/api.ts` | Получение страницы |
| `/notes/pages/` | POST | `features/notes/api.ts` | Создание страницы |
| `/notes/pages/:id/` | PATCH | `features/notes/api.ts` | Обновление страницы |
| `/notes/pages/:id/` | DELETE | `features/notes/api.ts` | Удаление страницы |
| `/notes/pages/:id/blocks/` | GET | `features/notes/api.ts` | Блоки страницы |
| `/notes/pages/:id/blocks/` | POST | `features/notes/api.ts` | Создание блока |
| `/notes/blocks/:id/` | PATCH | `features/notes/api.ts` | Обновление блока |
| `/notes/blocks/:id/` | DELETE | `features/notes/api.ts` | Удаление блока |
| `/notes/workspace/:id/recent/` | GET | `features/notes/api.ts` | Недавние страницы |
| `/notes/pages/:id/share/` | POST | `features/notes/api.ts` | Шаринг страницы |
| `/notes/pages/:id/shares/` | GET | `features/notes/api.ts` | Список шаринга |
| `/notes/pages/:id/archive/` | PATCH | `features/notes/api.ts` | Архивирование страницы |
| `/notes/pages/:id/duplicate/` | POST | `features/notes/api.ts` | Дублирование страницы |
| `/notes/pages/:id/children/` | GET | `features/notes/api.ts` | Дочерние страницы |
| `/notes/pages/:id/versions/` | GET | `features/notes/api.ts` | Версии страницы |
| `/notes/pages/search/` | GET | `features/notes/api.ts` | Поиск по страницам |

### ✅ Tasks модуль

| Frontend endpoint | Метод | Где вызывается | Описание |
|------------------|-------|----------------|----------|
| `/taskboards/` | GET | `features/tasks/api.ts` | Список досок задач |
| `/taskboards/:id/` | GET | `features/tasks/api.ts` | Получение доски |
| `/taskboards/` | POST | `features/tasks/api.ts` | Создание доски |
| `/taskboards/:id/` | PATCH | `features/tasks/api.ts` | Обновление доски |
| `/taskboards/:id/` | DELETE | `features/tasks/api.ts` | Удаление доски |
| `/taskboards/:id/columns/` | GET | `features/tasks/api.ts` | Колонки доски |
| `/taskboards/:id/columns/` | POST | `features/tasks/api.ts` | Создание колонки |
| `/taskboards/columns/:id/` | PATCH | `features/tasks/api.ts` | Обновление колонки |
| `/taskboards/columns/:id/` | DELETE | `features/tasks/api.ts` | Удаление колонки |
| `/taskboards/:id/tasks/` | GET | `features/tasks/api.ts` | Задачи доски |
| `/tasks/` | GET | `features/tasks/api.ts` | Список задач |
| `/tasks/:id/` | GET | `features/tasks/api.ts` | Получение задачи |
| `/tasks/` | POST | `features/tasks/api.ts` | Создание задачи |
| `/tasks/:id/` | PATCH | `features/tasks/api.ts` | Обновление задачи |
| `/tasks/:id/` | DELETE | `features/tasks/api.ts` | Удаление задачи |
| `/tasks/:id/move/` | PATCH | `features/tasks/api.ts` | Перемещение задачи |
| `/workspaces/:id/task-stats/` | GET | `features/tasks/api.ts` | Статистика задач |
| `/tasks/:id/activity/` | GET | `features/tasks/api.ts` | Активность задачи |

### 🗄️ Databases модуль

| Frontend endpoint | Метод | Где вызывается | Описание |
|------------------|-------|----------------|----------|
| `/databases/` | GET | `features/databases/api.ts` | Список баз данных |
| `/databases/:id/` | GET | `features/databases/api.ts` | Получение БД |
| `/databases/` | POST | `features/databases/api.ts` | Создание БД |
| `/databases/:id/` | PATCH | `features/databases/api.ts` | Обновление БД |
| `/databases/:id/` | DELETE | `features/databases/api.ts` | Удаление БД |
| `/databases/:id/properties/` | GET | `features/databases/api.ts` | Свойства БД |
| `/databases/:id/create_property/` | POST | `features/databases/api.ts` | Создание свойства |
| `/properties/:id/` | PATCH | `features/databases/api.ts` | Обновление свойства |
| `/properties/:id/` | DELETE | `features/databases/api.ts` | Удаление свойства |
| `/databases/:id/records/` | GET | `features/databases/api.ts` | Записи БД |
| `/records/:id/` | GET | `features/databases/api.ts` | Получение записи |
| `/databases/:id/create_record/` | POST | `features/databases/api.ts` | Создание записи |
| `/records/:id/` | PATCH | `features/databases/api.ts` | Обновление записи |
| `/records/:id/` | DELETE | `features/databases/api.ts` | Удаление записи |
| `/databases/:id/views/` | GET | `features/databases/api.ts` | Представления БД |
| `/databases/:id/create_view/` | POST | `features/databases/api.ts` | Создание представления |
| `/views/:id/` | PATCH | `features/databases/api.ts` | Обновление представления |
| `/views/:id/` | DELETE | `features/databases/api.ts` | Удаление представления |
| `/records/:id/history/` | GET | `features/databases/api.ts` | История записи |
| `/databases/:id/validate_formula/` | POST | `features/databases/api.ts` | Валидация формулы |

### 🔍 Search модуль

| Frontend endpoint | Метод | Где вызывается | Описание |
|------------------|-------|----------------|----------|
| `/search/search/` | POST | `features/search/api.ts` | Основной поиск |
| `/search/global/` | GET | `features/search/api.ts` | Глобальный поиск |
| `/search/workspace/:id/` | GET | `features/search/api.ts` | Поиск в workspace |
| `/quick-search/` | POST | `features/search/api.ts` | Быстрый поиск |
| `/search/autocomplete/` | GET | `features/search/api.ts` | Автодополнение |
| `/suggestions/` | GET | `features/search/api.ts` | Поисковые подсказки |
| `/search-history/` | GET | `features/search/api.ts` | История поиска |
| `/search-history/` | POST | `features/search/api.ts` | Добавление в историю |
| `/search-history/clear/` | DELETE | `features/search/api.ts` | Очистка истории |
| `/search-history/:id/` | DELETE | `features/search/api.ts` | Удаление элемента истории |
| `/saved-searches/` | GET | `features/search/api.ts` | Сохраненные поиски |
| `/saved-searches/` | POST | `features/search/api.ts` | Создание сохраненного поиска |
| `/saved-searches/:id/` | PATCH | `features/search/api.ts` | Обновление сохраненного поиска |
| `/saved-searches/:id/` | DELETE | `features/search/api.ts` | Удаление сохраненного поиска |
| `/saved-searches/:id/execute/` | POST | `features/search/api.ts` | Выполнение сохраненного поиска |

### 🔔 Notifications модуль

| Frontend endpoint | Метод | Где вызывается | Описание |
|------------------|-------|----------------|----------|
| `/notifications/` | GET | `features/notifications/api.ts` | Список уведомлений |
| `/notifications/:id/` | PATCH | `features/notifications/api.ts` | Отметить как прочитанное |
| `/notifications/mark_all_read/` | POST | `features/notifications/api.ts` | Отметить все как прочитанные |
| `/notifications/:id/` | DELETE | `features/notifications/api.ts` | Удаление уведомления |
| `/notifications/` | POST | `features/notifications/api.ts` | Создание уведомления |
| `/notification-settings/` | GET | `features/notifications/api.ts` | Настройки уведомлений |
| `/notification-settings/` | PATCH | `features/notifications/api.ts` | Обновление настроек |
| `/reminders/` | GET | `features/notifications/api.ts` | Список напоминаний |
| `/reminders/` | POST | `features/notifications/api.ts` | Создание напоминания |
| `/reminders/:id/` | PATCH | `features/notifications/api.ts` | Обновление напоминания |
| `/reminders/:id/` | DELETE | `features/notifications/api.ts` | Удаление напоминания |

## 🚨 Потенциальные проблемы

### 1. Разные варианты одного и того же пути

#### Проблема с properties
```typescript
// features/databases/api.ts - разные пути для свойств
'/databases/:id/create_property/'  // Создание свойства
'/properties/:id/'                 // Обновление/удаление свойства

// Рекомендация: унифицировать
'/databases/:id/properties/'       // GET, POST
'/databases/:id/properties/:id/'   // PATCH, DELETE
```

#### Проблема с records
```typescript
// features/databases/api.ts - разные пути для записей
'/databases/:id/create_record/'    // Создание записи
'/records/:id/'                    // Обновление/удаление записи

// Рекомендация: унифицировать
'/databases/:id/records/'          // GET, POST
'/databases/:id/records/:id/'      // PATCH, DELETE
```

#### Проблема с views
```typescript
// features/databases/api.ts - разные пути для представлений
'/databases/:id/create_view/'      // Создание представления
'/views/:id/'                      // Обновление/удаление представления

// Рекомендация: унифицировать
'/databases/:id/views/'            // GET, POST
'/databases/:id/views/:id/'        // PATCH, DELETE
```

### 2. Английские тексты в UI

#### Error messages в API
```typescript
// features/notes/api.ts
console.error('Error fetching tags:', error);
console.error('Error fetching pages:', error);
console.error('Error fetching page blocks:', error);
console.error('Error fetching recent pages:', error);
console.error('Error fetching page shares:', error);
console.error('Error fetching page children:', error);
console.error('Error fetching page versions:', error);

// features/tasks/api.ts
console.error('Error fetching task boards:', error);
console.error('Error fetching board columns:', error);
console.error('Error fetching board tasks:', error);
console.error('Error fetching tasks:', error);
console.error('Error fetching workspace tasks:', error);
console.error('Error fetching workspace task stats:', error);
console.error('Error fetching task activity:', error);

// features/auth/api.ts
console.error('Error fetching user profile:', error);
```

#### UI тексты на английском
```typescript
// pages/TaskBoardPage.tsx
return <div>Invalid workspace ID</div>;

// pages/WorkspacePage.tsx
return <div>Invalid workspace ID</div>;

// pages/WorkspaceSettingsPage.tsx
return <div>Invalid workspace ID</div>;

// pages/DatabasePage.tsx
return <div className="p-8 text-center text-gray-500">Неверный ID рабочего пространства</div>;
```

**🚨 Проблема**: Смешанные языки - некоторые ошибки на английском, некоторые на русском

**🎯 Рекомендация**: Унифицировать все сообщения на русский язык

### 3. Устаревшие/неиспользуемые клиенты

#### Отсутствие WebSocket API
- **Проблема**: В коде есть `socket.io-client`, но нет WebSocket API клиента
- **Рекомендация**: Создать WebSocket API для real-time обновлений

#### Отсутствие API для collaboration
- **Проблема**: Есть `useCollaboration` хук, но нет API клиента
- **Рекомендация**: Создать `features/collaboration/api.ts`

## 📊 Анализ качества API

### ✅ Сильные стороны
- **Централизованная конфигурация** через shared/api.ts
- **Автоматическое управление токенами** через interceptors
- **Типизация** всех API интерфейсов
- **Единообразная структура** для всех модулей
- **Обработка ошибок** с fallback значениями

### ⚠️ Области для улучшения
- **Неунифицированные пути** для CRUD операций
- **Смешанные языки** в сообщениях об ошибках
- **Отсутствие WebSocket API** клиента
- **Дублирование логики** обработки ошибок
- **Отсутствие retry механизма** для failed запросов

## 🎯 Рекомендации для редизайна

### 1. Унифицировать API пути
```typescript
// Стандартный RESTful паттерн для всех модулей
'/api/v1/workspaces/:id/pages/'           // GET, POST
'/api/v1/workspaces/:id/pages/:pageId/'   // GET, PATCH, DELETE
'/api/v1/workspaces/:id/tasks/'           // GET, POST
'/api/v1/workspaces/:id/tasks/:taskId/'   // GET, PATCH, DELETE
'/api/v1/workspaces/:id/databases/'       // GET, POST
'/api/v1/workspaces/:id/databases/:dbId/' # GET, PATCH, DELETE
```

### 2. Создать WebSocket API клиент
```typescript
// features/collaboration/api.ts
export const collaborationApi = {
  // Подключение к WebSocket
  connect: (workspaceId: string) => socket.connect(`/ws/workspace/${workspaceId}/`),
  
  // Подписка на события
  subscribe: (event: string, callback: Function) => socket.on(event, callback),
  
  // Отправка событий
  emit: (event: string, data: any) => socket.emit(event, data),
  
  // Отключение
  disconnect: () => socket.disconnect(),
};
```

### 3. Унифицировать обработку ошибок
```typescript
// shared/api/errorHandler.ts
export const handleApiError = (error: any, fallback: any) => {
  console.error('Ошибка API:', error);
  
  // Логирование в систему мониторинга
  logError(error);
  
  // Возврат fallback значения
  return fallback;
};
```

### 4. Добавить retry механизм
```typescript
// shared/api/retry.ts
export const withRetry = async (
  apiCall: () => Promise<any>, 
  maxRetries: number = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 5. Стандартизировать API модули
```typescript
// Стандартный шаблон для API модуля
export const standardApi = {
  // CRUD операции
  list: (params?: any) => api.get('/endpoint/', { params }),
  get: (id: string) => api.get(`/endpoint/${id}/`),
  create: (data: any) => api.post('/endpoint/', data),
  update: (id: string, data: any) => api.patch(`/endpoint/${id}/`, data),
  delete: (id: string) => api.delete(`/endpoint/${id}/`),
  
  // Специфичные операции
  customAction: (id: string, data: any) => api.post(`/endpoint/${id}/action/`, data),
};
```

## 📈 Итоговая оценка API

### ✅ Сильные стороны
- **Хорошая архитектура** с разделением по модулям
- **Централизованная конфигурация** и interceptors
- **Полная типизация** всех интерфейсов
- **Единообразная структура** для всех модулей

### ⚠️ Области для улучшения
- **Неунифицированные API пути** - нужна стандартизация
- **Смешанные языки** - унифицировать на русский
- **Отсутствие WebSocket API** - добавить для real-time
- **Дублирование логики** - вынести в общие утилиты

### 🎯 Приоритеты для редизайна
1. **Высокий** - Унифицировать API пути по RESTful стандарту
2. **Высокий** - Создать WebSocket API клиент
3. **Средний** - Унифицировать языки сообщений на русский
4. **Средний** - Стандартизировать структуру API модулей
5. **Низкий** - Добавить retry механизм и улучшенную обработку ошибок
6. **Долгосрочный** - Внедрить API версионирование (/api/v1/, /api/v2/)
