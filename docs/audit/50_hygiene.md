# 🧹 Гигиена кода - Аудит

## 🚨 Дубликаты компонентов/хуков/утилит

### 🔴 Критические дубликаты

#### 1. **CreateTaskModal** - Дублирование модала создания задач

**Файлы:**
- `frontend/src/components/tasks/CreateTaskModal.tsx` (289 строк)
- `frontend/src/widgets/TaskBoard/CreateTaskModal.tsx` (291 строка)

**Анализ дублирования:**
```typescript
// Оба файла имеют идентичную структуру:
interface CreateTaskModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Одинаковая логика:
- useState для formData
- useCreateTask, useBoardColumns, useTags хуки
- priorities массив
- handleSubmit и handleClose функции
- Одинаковые поля формы
```

**Различия:**
- **components/tasks/CreateTaskModal.tsx**: 
  - Импортирует `ru` локализацию
  - Ошибка на русском: `'Не удалось создать задачу:'`
  - Импортирует `Transition` из Headless UI
  
- **widgets/TaskBoard/CreateTaskModal.tsx**:
  - НЕ импортирует локализацию
  - Ошибка на английском: `'Failed to create task:'`
  - НЕ импортирует `Transition`

**🚨 Проблема**: Два почти идентичных компонента с разными языками ошибок

**🎯 Решение**: Объединить в один компонент в `shared/ui/` или `features/tasks/ui/`

### 🟡 Потенциальные дубликаты

#### 2. **TaskModal vs CreateTaskModal** - Схожая функциональность

**Файлы:**
- `frontend/src/widgets/TaskBoard/TaskModal.tsx` (512 строк)
- `frontend/src/widgets/TaskBoard/CreateTaskModal.tsx` (291 строка)

**Анализ:**
- **TaskModal**: Полнофункциональный модал для создания/редактирования задач
- **CreateTaskModal**: Упрощенная версия только для создания

**🎯 Рекомендация**: Использовать TaskModal для всех операций, удалить CreateTaskModal

#### 3. **DatabaseTable компоненты** - Дублирование логики

**Файлы:**
- `frontend/src/features/databases/ui/DatabaseTable.tsx`
- `frontend/src/widgets/DatabaseTable/DatabaseTable.tsx`

**🎯 Рекомендация**: Объединить в один компонент в `features/databases/ui/`

## 💀 Мёртвый код и неиспользуемые файлы

### 🔴 Неиспользуемые компоненты

#### 1. **PagesDemo** - Демо компонент без использования

**Файл:** `frontend/src/widgets/TaskBoard/PagesDemo.tsx` (48 строк)

**Статус:** ❌ Не используется нигде в проекте

**Код:**
```typescript
const PagesDemo: React.FC = () => {
  const mockPages = [
    // Mock данные для демонстрации
  ];
  
  return (
    <div className="p-6">
      <PagesList pages={mockPages} />
      <PageDrawer isOpen={false} onClose={() => {}} page={null} />
    </div>
  );
};
```

**🎯 Рекомендация:** Удалить файл и экспорт из `index.ts`

#### 2. **Тестовые файлы** - Мок-данные в продакшене

**Файлы:**
- `frontend/src/widgets/TaskBoard/PagesDemo.tsx` - содержит mock данные
- `frontend/src/setupTests.ts` - содержит mock функции для тестов

**🎯 Рекомендация:** Убрать PagesDemo из продакшена, оставить только в dev режиме

### 🟡 Потенциально неиспользуемые экспорты

#### 3. **Экспорты в index.ts файлах**

**Проблема:** Многие компоненты экспортируются, но не используются

**Пример:**
```typescript
// frontend/src/widgets/TaskBoard/index.ts
export { default as PagesDemo } from './PagesDemo';  // ❌ Не используется
export { default as PageDrawer } from './PageDrawer'; // ✅ Используется
```

**🎯 Рекомендация:** Проверить все экспорты на реальное использование

## 🌐 Английский UI в интерфейсе

### 🔴 Критические английские строки

#### 1. **Error messages в API** (35+ вхождений)

**Файл:** `frontend/src/features/notes/api.ts`
```typescript
console.error('Error fetching tags:', error);           // ❌ EN
console.error('Error fetching pages:', error);          // ❌ EN
console.error('Error fetching page blocks:', error);    // ❌ EN
console.error('Error fetching recent pages:', error);   // ❌ EN
console.error('Error fetching page shares:', error);    // ❌ EN
console.error('Error fetching page children:', error);  // ❌ EN
console.error('Error fetching page versions:', error);  // ❌ EN
```

**Файл:** `frontend/src/features/tasks/api.ts`
```typescript
console.error('Error fetching task boards:', error);    // ❌ EN
console.error('Error fetching board columns:', error);  // ❌ EN
console.error('Error fetching board tasks:', error);    // ❌ EN
console.error('Error fetching tasks:', error);          // ❌ EN
console.error('Error fetching workspace tasks:', error); // ❌ EN
console.error('Error fetching workspace task stats:', error); // ❌ EN
console.error('Error fetching task activity:', error);  // ❌ EN
```

**Файл:** `frontend/src/features/auth/api.ts`
```typescript
console.error('Error fetching user profile:', error);   // ❌ EN
```

#### 2. **UI тексты на английском** (15+ вхождений)

**Файл:** `frontend/src/pages/TaskBoardPage.tsx`
```typescript
return <div>Invalid workspace ID</div>;                 // ❌ EN
```

**Файл:** `frontend/src/pages/WorkspacePage.tsx`
```typescript
return <div>Invalid workspace ID</div>;                 // ❌ EN
```

**Файл:** `frontend/src/pages/WorkspaceSettingsPage.tsx`
```typescript
return <div>Invalid workspace ID</div>;                 // ❌ EN
```

**Файл:** `frontend/src/features/notes/ui/editor/EditorToolbar.tsx`
```typescript
placeholder="Enter URL..."                              // ❌ EN
placeholder="https://example.com/image.jpg"             // ❌ EN
```

**Файл:** `frontend/src/features/notes/ui/editor/RichTextEditor.tsx`
```typescript
placeholder = 'Start writing...',                       // ❌ EN
```

**Файл:** `frontend/src/features/notes/ui/pages/PageEditor.tsx`
```typescript
placeholder="Start writing..."                          // ❌ EN
```

**Файл:** `frontend/src/features/notes/ui/editor/EditorBubbleMenu.tsx`
```typescript
const url = window.prompt('Enter URL:');                // ❌ EN
```

#### 3. **Смешанные языки в одном компоненте**

**Файл:** `frontend/src/widgets/TaskBoard/CreateTaskModal.tsx`
```typescript
// Приоритеты на английском
{ value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
{ value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
{ value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
{ value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-yellow-800' },

// Ошибка на английском
console.error('Failed to create task:', error);         // ❌ EN
```

**Файл:** `frontend/src/components/tasks/CreateTaskModal.tsx`
```typescript
// Приоритеты на английском (такие же)
{ value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },

// Ошибка на русском
console.error('Не удалось создать задачу:', error);     // ✅ RU
```

**🚨 Проблема:** Одинаковые компоненты с разными языками

## 📝 TODO/FIXME/заглушки

### 🔴 TODO комментарии (10+ вхождений)

#### 1. **Frontend TODO**

**Файл:** `frontend/src/features/notes/ui/pages/PageEditor.tsx`
```typescript
// TODO: Implement share functionality                    // ❌ Не реализовано
// TODO: Implement version restoration                    // ❌ Не реализовано
```

#### 2. **Backend TODO**

**Файл:** `backend/services/account_service.py`
```python
# TODO: Реализовать сохранение токена и отправку email    # ❌ Не реализовано
# TODO: Реализовать проверку токена и поиск пользователя  # ❌ Не реализовано
```

### 🟡 FIXME и HACK комментарии

#### 3. **Отсутствуют, но должны быть**

**Проблема:** Много кода выглядит как заглушка, но не помечен как TODO

**Примеры:**
```typescript
// Вместо TODO:
placeholder="Start writing..."                           // ❌ Заглушка
placeholder="Enter URL..."                              // ❌ Заглушка
placeholder="https://example.com/image.jpg"             // ❌ Заглушка

// Должно быть:
// TODO: Перевести на русский язык
placeholder="Начните писать..."                         // ✅ RU
```

### 🟢 Placeholder и Mock данные

#### 4. **Тестовые данные в продакшене**

**Файл:** `frontend/src/widgets/TaskBoard/PagesDemo.tsx`
```typescript
const mockPages = [                                     // ❌ Mock в продакшене
  {
    id: '1',
    title: 'Демо страница 1',
    content: 'Это демо страница для тестирования...',
    // ... другие поля
  }
];
```

**Файл:** `frontend/src/setupTests.ts`
```typescript
// Mock IntersectionObserver                              // ✅ Только для тестов
// Mock ResizeObserver                                    // ✅ Только для тестов
// Mock matchMedia                                        // ✅ Только для тестов
```

## 📊 Анализ качества гигиены

### ✅ Сильные стороны
- **Хорошая структура** проекта по FSD
- **Типизация** всех компонентов
- **Тесты** для основных компонентов
- **Локализация** частично реализована

### ⚠️ Области для улучшения
- **Дублирование компонентов** (CreateTaskModal)
- **Смешанные языки** в UI (EN/RU)
- **TODO комментарии** без реализации
- **Mock данные** в продакшене
- **Неиспользуемые компоненты** (PagesDemo)

### 🚨 Критические проблемы
- **Дубли CreateTaskModal** - нарушение DRY принципа
- **Английские ошибки** в API - неконсистентность
- **Смешанные языки** в одном компоненте
- **Неиспользуемый код** в продакшене

## 🎯 Рекомендации по очистке

### P0 (Критично)

#### 1. **Устранить дубли CreateTaskModal**
```typescript
// Объединить в один компонент:
// frontend/src/features/tasks/ui/CreateTaskModal.tsx

// Удалить дубли:
// frontend/src/components/tasks/CreateTaskModal.tsx
// frontend/src/widgets/TaskBoard/CreateTaskModal.tsx
```

#### 2. **Унифицировать языки ошибок**
```typescript
// Создать константы для ошибок:
const ERROR_MESSAGES = {
  FETCH_TAGS: 'Ошибка загрузки тегов',
  FETCH_PAGES: 'Ошибка загрузки страниц',
  FETCH_TASKS: 'Ошибка загрузки задач',
  // ... другие ошибки
};

// Использовать везде:
console.error(ERROR_MESSAGES.FETCH_TAGS, error);
```

#### 3. **Удалить неиспользуемые компоненты**
```bash
# Удалить файлы:
rm frontend/src/widgets/TaskBoard/PagesDemo.tsx

# Обновить экспорты:
# frontend/src/widgets/TaskBoard/index.ts
```

### P1 (Высокий)

#### 4. **Реализовать TODO комментарии**
```typescript
// Вместо TODO:
// TODO: Implement share functionality

// Реализовать:
const handleShare = async () => {
  // Логика шаринга
};
```

#### 5. **Перевести все английские строки**
```typescript
// Вместо:
placeholder="Start writing..."

// Использовать:
placeholder={ru.editor.startWriting}
```

### P2 (Средний)

#### 6. **Создать систему констант для UI**
```typescript
// frontend/src/shared/constants/ui.ts
export const UI_CONSTANTS = {
  PLACEHOLDERS: {
    START_WRITING: 'Начните писать...',
    ENTER_URL: 'Введите URL...',
    ENTER_EMAIL: 'Введите email...',
  },
  ERRORS: {
    INVALID_WORKSPACE_ID: 'Неверный ID рабочего пространства',
    FETCH_ERROR: 'Ошибка загрузки данных',
  }
};
```

#### 7. **Добавить ESLint правила**
```json
// .eslintrc.js
{
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "no-duplicate-imports": "error"
  }
}
```

### P3 (Низкий)

#### 8. **Создать скрипт очистки**
```bash
# scripts/cleanup.sh
#!/bin/bash

# Удалить дубли
# Удалить неиспользуемые файлы
# Проверить TODO комментарии
# Проверить языки в UI
```

#### 9. **Добавить pre-commit хуки**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run check-duplicates"
    }
  }
}
```

## 📈 Итоговая оценка гигиены

### ✅ Сильные стороны
- **Хорошая архитектура** проекта
- **Типизация** компонентов
- **Тестирование** основных компонентов
- **Локализация** частично реализована

### ⚠️ Области для улучшения
- **Дублирование кода** (CreateTaskModal)
- **Смешанные языки** в UI
- **TODO комментарии** без реализации
- **Неиспользуемые компоненты**

### 🚨 Критические проблемы
- **Нарушение DRY принципа** (дубли компонентов)
- **Неконсистентность языков** (EN/RU смешение)
- **Мёртвый код** в продакшене

### 🎯 Приоритеты для очистки
1. **P0** - Устранить дубли CreateTaskModal
2. **P0** - Унифицировать языки ошибок
3. **P1** - Реализовать TODO комментарии
4. **P1** - Перевести все английские строки
5. **P2** - Создать систему констант для UI
6. **P3** - Добавить автоматизацию очистки
