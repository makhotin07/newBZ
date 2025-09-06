# Поиск заглушек и «пустых» кнопок

## Критичные заглушки (P0)

### 1. API методы - полные заглушки

#### `frontend/src/features/notes/api.ts` - ВСЕ МЕТОДЫ ЗАГЛУШКИ
```typescript
// ❌ КРИТИЧНО: Все методы возвращают заглушки
export const notesApi = {
  getTags: async () => {
    return { results: [] };  // ← ЗАГЛУШКА
  },
  
  getPage: async (id: string) => {
    return {
      id,
      title: 'Заглушка',  // ← ЗАГЛУШКА
      content: '',
      // ... все поля - заглушки
    };
  },
  
  // ... ВСЕ ОСТАЛЬНЫЕ МЕТОДЫ - ЗАГЛУШКИ
};
```

**Проблема**: Основной функционал заметок не работает
**Исправление**: Заменить на реальные API вызовы

### 2. Синтаксические ошибки

#### `backend/api/urls.py` (строки 88-89, 129)
```python
# ❌ СИНТАКСИЧЕСКАЯ ОШИБКА
notifications_router.register(
    r"settings",
    ,  # ← ОШИБКА: пустой параметр
    basename="notificationsettings",
)

# ❌ СИНТАКСИЧЕСКАЯ ОШИБКА  
path("auth/register/",  # ← ОШИБКА: отсутствует ViewSet
```

#### `frontend/src/features/databases/api.ts` (строки 57, 88)
```typescript
// ❌ СИНТАКСИЧЕСКАЯ ОШИБКА
deleteRecord: (recordId: string) => 
  api.delete(`/records/${recordId}/`)  // ← ОШИБКА: нет запятой

// ❌ СИНТАКСИЧЕСКАЯ ОШИБКА
validateFormula: (expression: string, databaseId: string) => 
  api.post<{ valid: boolean; error?: string; dependencies?: string[] }>(`/databases/${databaseId}/validate_formula/`, {
    expression
  },  // ← ОШИБКА: лишняя запятая
};
```

#### `frontend/src/features/search/api.ts` (строки 156, 204)
```typescript
// ❌ СИНТАКСИЧЕСКАЯ ОШИБКА
getSearchHistory:  // ← ОШИБКА: отсутствует тело функции
  const response = await api.get('/search-history/', {
    params: { workspace_id },
  });
  return response.data;
},

// ❌ СИНТАКСИЧЕСКАЯ ОШИБКА
executeSavedSearch: async (id: string, page?: number, page_size?: number): Promise<SearchResponse> => {
  const response = await api.post(`/saved-searches/${id}/execute/`, {}, {
    params: { page, page_size },
  });
  return response.data;
},  // ← ОШИБКА: лишняя запятая
};
```

## Важные заглушки (P1)

### 1. Пустые обработчики событий

#### `frontend/src/pages/WorkspacePage.tsx` (строки 28-30)
```typescript
// ⚠️ ЗАГЛУШКА: Пустые console.log
const { isOpen, drawerValue, closeDrawer } = useDrawer({
  paramName: 'preview',
  onOpen: () => console.log('Drawer открыт'),  // ← ЗАГЛУШКА
  onClose: () => console.log('Drawer закрыт')  // ← ЗАГЛУШКА
});
```

#### `frontend/src/features/databases/ui/views/BoardView.tsx` (строки 145-158)
```typescript
// ⚠️ ЗАГЛУШКА: TODO комментарии с console.log
switch (action) {
  case 'assign':
    // TODO: Открыть модальное окно для назначения пользователя
    console.log('Назначить пользователя для записи:', recordId);  // ← ЗАГЛУШКА
    break;
  case 'due':
    // TODO: Открыть модальное окно для установки срока
    console.log('Установить срок для записи:', recordId);  // ← ЗАГЛУШКА
    break;
  // ... остальные case - заглушки
}
```

### 2. Заглушки в API методах

#### `frontend/src/features/tasks/api.ts` - Fallback заглушки
```typescript
// ⚠️ ЗАГЛУШКА: Возврат пустых массивов при ошибках
async getTaskBoards(params?: { workspace?: string }): Promise<TaskBoard[]> {
  try {
    // ... API вызов
  } catch (error) {
    console.error('Error fetching task boards:', error);
    return [];  // ← ЗАГЛУШКА: пустой массив при ошибке
  }
}
```

#### `frontend/src/features/workspaces/api.ts` (строка 80)
```typescript
// ⚠️ ЗАГЛУШКА: Fallback для пагинации
if (response.data && Array.isArray(response.data)) {
  return response.data;
}
// Если есть пагинация, возвращаем results
return response.data.results || [];  // ← ЗАГЛУШКА: fallback
```

### 3. Заглушки в UI компонентах

#### `frontend/src/pages/WorkspacePage.tsx` (строка 132)
```typescript
// ⚠️ ЗАГЛУШКА: TODO комментарий
<PagePreview
  isOpen={isOpen}
  onClose={closeDrawer}
  page={null} // TODO: загрузить страницу по ID  // ← ЗАГЛУШКА
  workspaceId={workspaceId}
/>
```

#### `frontend/src/features/notes/ui/pages/PageEditor.tsx` (строки 122-123, 347-348)
```typescript
// ⚠️ ЗАГЛУШКА: TODO с заглушками
const handleShare = () => {
  // TODO: Implement share functionality
  toast.success('Share functionality coming soon!');  // ← ЗАГЛУШКА
};

// ⚠️ ЗАГЛУШКА: TODO с заглушками
onRestore={(version) => {
  // TODO: Implement version restoration
  toast.success('Version restored!');  // ← ЗАГЛУШКА
  setShowVersions(false);
}}
```

## Менее критичные заглушки (P2)

### 1. Заглушки в тестах (нормально)

#### `frontend/src/setupTests.ts` - Mock объекты
```typescript
// ✅ НОРМАЛЬНО: Тестовые моки
const mockLocation = {
  href: 'http://localhost',
  origin: 'http://localhost',
  // ...
};

Object.defineProperty(window, 'location', {
  value: mockLocation,  // ← НОРМАЛЬНО: тестовый мок
  writable: true,
});
```

#### `frontend/src/__tests__/hooks/useAuth.test.ts` - Mock API
```typescript
// ✅ НОРМАЛЬНО: Тестовые моки
jest.mock('../../shared/api', () => ({
  defaults: { headers: { common: {} } },
  post: jest.fn(),  // ← НОРМАЛЬНО: тестовый мок
  get: jest.fn(),
  // ...
}));
```

### 2. Заглушки в расширениях

#### `frontend/src/shared/extensions/DatabaseExtension.ts` (строки 137-142)
```typescript
// ⚠️ ЗАГЛУШКА: TODO с console.log
const handleOpenDatabase = () => {
  // Здесь можно открыть модальное окно или перейти к базе данных
  console.log('Открыть базу данных:', { databaseId, viewId });  // ← ЗАГЛУШКА
};

const handleEditBlock = () => {
  // Здесь можно открыть модальное окно для редактирования блока
  console.log('Редактировать блок базы данных:', { databaseId, viewId });  // ← ЗАГЛУШКА
};
```

### 3. Заглушки в аналитике

#### `frontend/src/shared/analytics/PerformanceMonitor.tsx` (строка 155)
```typescript
// ⚠️ ЗАГЛУШКА: TODO с console.log
const sendToAnalytics = (event: PerformanceEvent) => {
  // Google Analytics, Mixpanel, Amplitude и т.д.
  console.log('Performance Event:', event);  // ← ЗАГЛУШКА
  // TODO: Implement real analytics
};
```

## Пустые кнопки и неработающие элементы

### 1. Кнопки социальной авторизации

#### `frontend/src/pages/auth/LoginPage.tsx` (строки 145-158)
```typescript
// ❌ НЕ РАБОТАЕТ: Кнопки без обработчиков
<div className="mt-6 grid grid-cols-2 gap-3">
  <button
    type="button"
    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
  >
    <span>Google</span>  {/* ← НЕ РАБОТАЕТ: нет onClick */}
  </button>
  <button
    type="button"
    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
  >
    <span>GitHub</span>  {/* ← НЕ РАБОТАЕТ: нет onClick */}
  </button>
</div>
```

### 2. Кнопки без функционала

#### `frontend/src/pages/DatabasePage.tsx` (строки 137-145)
```typescript
// ❌ НЕ РАБОТАЕТ: Кнопки без обработчиков
<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
  <FunnelIcon className="w-5 h-5" />  {/* ← НЕ РАБОТАЕТ: нет onClick */}
</button>
<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
  <Cog6ToothIcon className="w-5 h-5" />  {/* ← НЕ РАБОТАЕТ: нет onClick */}
</button>
<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
  <EllipsisHorizontalIcon className="w-5 h-5" />  {/* ← НЕ РАБОТАЕТ: нет onClick */}
</button>
```

### 3. Заглушки в DashboardPage

#### `frontend/src/pages/DashboardPage.tsx` (строки 231-248)
```typescript
// ❌ ЗАГЛУШКА: Статичные данные задач
<div className="space-y-3">
  <div className="flex items-center p-3 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
    <CalendarIcon className="w-4 h-4 text-red-600 mr-2" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">Рассмотреть предложение проекта</p>
      <p className="text-xs text-gray-500">До выполнения 2 часа</p>
    </div>
    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Высокий</span>
  </div>
  {/* ← ЗАГЛУШКА: статичные данные */}
</div>
```

## Рекомендации по исправлению

### 1. Критичные исправления (P0)

1. **Заменить API заглушки**:
   - `frontend/src/features/notes/api.ts` - все методы
   - `frontend/src/features/search/api.ts` - все методы
   - `frontend/src/features/notifications/api.ts` - все методы

2. **Исправить синтаксические ошибки**:
   - `backend/api/urls.py` - завершить регистрацию ViewSets
   - `frontend/src/features/databases/api.ts` - исправить запятые
   - `frontend/src/features/search/api.ts` - завершить функции

### 2. Важные исправления (P1)

1. **Реализовать пустые обработчики**:
   - Кнопки социальной авторизации
   - Кнопки в DatabasePage
   - TODO функции в PageEditor

2. **Заменить console.log на реальную логику**:
   - Drawer обработчики
   - BoardView действия
   - DatabaseExtension функции

### 3. Улучшения (P2)

1. **Добавить реальную аналитику**:
   - PerformanceMonitor
   - Google Analytics/Mixpanel

2. **Улучшить обработку ошибок**:
   - Заменить пустые массивы на proper error handling
   - Добавить fallback UI

## Состояние реализации

| Тип заглушки | Количество | Критичность | Статус |
|--------------|------------|-------------|--------|
| API методы | 15+ | P0 | ❌ Критично |
| Синтаксические ошибки | 5 | P0 | ❌ Критично |
| Пустые обработчики | 10+ | P1 | ⚠️ Важно |
| Console.log заглушки | 20+ | P2 | ⚠️ Менее важно |
| Тестовые моки | 15+ | - | ✅ Нормально |

**Общая оценка**: 30% готовности (много критичных заглушек)
