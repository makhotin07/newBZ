# Интеграция баз данных в TipTap редактор

Модуль предоставляет возможность вставлять базы данных как блоки на страницы через TipTap редактор.

## Возможности

- ✅ **TipTap расширение** для блока базы данных
- ✅ **Slash-команды** для быстрой вставки
- ✅ **Модальное окно** выбора базы и представления
- ✅ **API интеграция** с системой блоков страниц
- ✅ **Рендеринг** базы данных в редакторе

## Архитектура

### 1. TipTap расширение

**Файл:** `shared/extensions/DatabaseExtension.ts`

Создает новый node type "database" для TipTap:

```typescript
import { DatabaseExtension } from '@/shared/extensions';

// В конфигурации редактора
extensions: [
  // ... другие расширения
  DatabaseExtension.configure({
    HTMLAttributes: {
      class: 'database-block my-4',
    },
  }),
]
```

**Атрибуты блока:**
- `databaseId` - ID базы данных
- `viewId` - ID представления (опционально)

**Команды:**
- `insertDatabase` - вставить блок базы данных
- `updateDatabase` - обновить блок базы данных

### 2. Slash-команды

**Файл:** `SlashCommands.tsx`

Добавлена команда `/database` для быстрой вставки:

```typescript
{
  id: 'database',
  title: 'База данных',
  description: 'Вставить базу данных',
  command: () => {
    if (onInsertDatabase) {
      onInsertDatabase();
    }
    onClose();
  },
  keywords: ['база', 'database', 'данные', 'таблица', 'db']
}
```

### 3. Модальное окно вставки

**Файл:** `DatabaseBlockInsert.tsx`

Компонент для выбора базы данных и представления:

```typescript
<DatabaseBlockInsert
  pageId={pageId}
  onInsert={handleInsertDatabase}
  onCancel={() => setShowModal(false)}
/>
```

**Функциональность:**
- Поиск баз данных по названию/описанию
- Выбор представления (опционально)
- Отображение метаданных базы
- Валидация выбора

### 4. API интеграция

**Файл:** `notes/api.ts`

Добавлены методы для работы с блоками базы данных:

```typescript
// Создание блока базы данных
async createDatabaseBlock(pageId: string, databaseId: string, viewId?: string): Promise<Block>

// Обновление блока базы данных
async updateDatabaseBlock(blockId: string, databaseId: string, viewId?: string): Promise<Block>
```

**Структура блока:**
```typescript
{
  type: 'database',
  content: {
    database_id: string;
    view_id?: string;
  },
  position: number;
}
```

### 5. Рендеринг блока

**Файл:** `DatabaseBlockRenderer.tsx`

Компонент для отображения блока базы данных:

```typescript
<DatabaseBlockRenderer
  databaseId={databaseId}
  viewId={viewId}
  className="custom-styles"
/>
```

**Функциональность:**
- Загрузка данных базы
- Отображение заголовка и описания
- Интеграция с DatabaseTable
- Ссылка на полную страницу базы

## Использование

### 1. В RichTextEditor

```typescript
import { RichTextEditor } from '@/features/notes/ui/editor';

function MyEditor() {
  const handleInsertDatabase = () => {
    // Логика вставки базы данных
  };

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      onInsertDatabase={handleInsertDatabase}
      showToolbar={true}
    />
  );
}
```

### 2. Программная вставка

```typescript
import { notesApi } from '@/features/notes/api';

// Создание блока
const block = await notesApi.createDatabaseBlock(pageId, databaseId, viewId);

// Обновление блока
const updatedBlock = await notesApi.updateDatabaseBlock(blockId, databaseId, newViewId);
```

### 3. Slash-команды

В редакторе введите `/` и выберите "База данных" из списка команд.

## Пример полной интеграции

```typescript
import React, { useState } from 'react';
import { DatabaseBlockExample } from '@/features/notes/ui/editor';

function MyPage() {
  return (
    <DatabaseBlockExample 
      pageId="your-page-id"
      className="custom-styles"
    />
  );
}
```

## Стилизация

### CSS классы

```css
/* Блок базы данных */
.database-block {
  margin: 1rem 0;
}

/* Обертка блока */
.database-block-wrapper {
  position: relative;
}

/* Placeholder для блока */
.database-placeholder {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  padding: 2rem;
  text-align: center;
}

/* Содержимое блока */
.database-block-content {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}
```

### Tailwind CSS

```tsx
// Заголовок блока
<div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">

// Placeholder
<div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">

// Кнопки действий
<button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
```

## Производительность

### Оптимизации

- **Ленивая загрузка** - данные базы загружаются только при необходимости
- **Кеширование** - React Query кеширует запросы
- **Мемоизация** - компоненты оптимизированы для предотвращения лишних рендеров

### Ограничения

- Блоки базы данных загружают данные асинхронно
- При большом количестве блоков может потребоваться виртуализация
- Рекомендуется ограничить количество блоков на одной странице

## Безопасность

### Валидация

- Проверка существования базы данных
- Проверка прав доступа к workspace
- Валидация ID представления

### Санитизация

- HTML-контент экранируется
- JavaScript-код не выполняется
- XSS-атаки предотвращаются

## Тестирование

### Unit тесты

```typescript
// Тест расширения
import { DatabaseExtension } from '@/shared/extensions';

describe('DatabaseExtension', () => {
  it('should create database node', () => {
    // Тест создания узла
  });
});
```

### Интеграционные тесты

```typescript
// Тест вставки блока
import { DatabaseBlockInsert } from '@/features/notes/ui/editor';

describe('DatabaseBlockInsert', () => {
  it('should insert database block', () => {
    // Тест вставки блока
  });
});
```

## Будущие улучшения

### Планируемые функции

- **Drag-n-drop** блоков базы данных
- **Редактирование** блока прямо в редакторе
- **Предпросмотр** представлений
- **Массовая вставка** нескольких баз
- **Шаблоны** блоков базы данных

### Архитектурные улучшения

- **Виртуализация** для больших списков
- **WebSocket** для real-time обновлений
- **Оффлайн режим** с синхронизацией
- **Плагинная система** для расширений
