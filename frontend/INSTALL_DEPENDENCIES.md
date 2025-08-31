# Установка зависимостей для проекта

## Необходимые зависимости

Для корректной работы всех компонентов проекта необходимо установить следующие зависимости:

### 1. react-beautiful-dnd

Библиотека для drag-n-drop функциональности в представлениях базы данных.

```bash
# Используя npm
npm install react-beautiful-dnd @types/react-beautiful-dnd

# Используя yarn
yarn add react-beautiful-dnd @types/react-beautiful-dnd

# Используя pnpm
pnpm add react-beautiful-dnd @types/react-beautiful-dnd
```

### 2. Проверка установки

После установки убедитесь, что зависимости добавлены в `package.json`:

```json
{
  "dependencies": {
    "react-beautiful-dnd": "^13.1.1"
  },
  "devDependencies": {
    "@types/react-beautiful-dnd": "^13.1.8"
  }
}
```

## Временные заглушки

В текущей версии кода используются временные заглушки для `react-beautiful-dnd`:

```typescript
// Временные заглушки для react-beautiful-dnd
const DragDropContext = ({ children, onDragEnd }: any) => <div>{children}</div>;
const Droppable = ({ children, droppableId }: any) => <div data-droppable-id={droppableId}>{children}</div>;
const Draggable = ({ children, draggableId, index }: any) => <div data-draggable-id={draggableId} data-index={index}>{children}</div>;
type DropResult = any;
```

## Активация drag-n-drop

После установки зависимостей раскомментируйте импорты в следующих файлах:

1. `src/features/databases/ui/views/BoardView.tsx`
2. `src/features/databases/ui/views/CalendarView.tsx`
3. `src/features/databases/ui/views/TimelineView.tsx`

Замените временные заглушки на:

```typescript
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
```

## Функциональность

После установки зависимостей будут доступны:

- ✅ **Drag-n-drop** между колонками в BoardView (Kanban)
- ✅ **Drag-n-drop** для изменения дат в CalendarView
- ✅ **Drag-n-drop** для изменения временных рамок в TimelineView
- ✅ **Визуальная обратная связь** при перетаскивании
- ✅ **Анимации** и эффекты перетаскивания

## Альтернативы

Если возникнут проблемы с `react-beautiful-dnd`, можно использовать:

- **@dnd-kit/core** - современная альтернатива
- **react-dnd** - более гибкая библиотека
- **SortableJS** - легковесное решение

## Устранение проблем

### Ошибка "Cannot find module 'react-beautiful-dnd'"

```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install

# Или для yarn
rm -rf node_modules yarn.lock
yarn install
```

### Проблемы с TypeScript

Убедитесь, что установлены типы:

```bash
npm install --save-dev @types/react-beautiful-dnd
```

### Конфликты версий

Проверьте совместимость версий React и react-beautiful-dnd:

- React 18.x → react-beautiful-dnd ^13.1.1
- React 17.x → react-beautiful-dnd ^13.1.1
- React 16.x → react-beautiful-dnd ^13.1.1

## Проверка работоспособности

После установки зависимостей:

1. Запустите проект: `npm start` или `yarn start`
2. Откройте страницу с базами данных
3. Проверьте drag-n-drop функциональность в различных представлениях
4. Убедитесь, что нет ошибок в консоли браузера
