# Обзор стека и конфигурации фронтенда

## Основной стек

### React и окружение
- **React**: 18.2.0 (функциональные компоненты)
- **TypeScript**: 4.9.5 (строгая типизация включена)
- **Node.js**: 18 (из Dockerfile.frontend)
- **Сборщик**: Create React App (react-scripts 5.0.1)

### Роутинг и навигация
- **React Router DOM**: 6.18.0 (современная версия с hooks)

### Управление состоянием
- **React Query**: 5.85.5 (@tanstack/react-query) - основной инструмент для серверного состояния
- **React Hook Form**: 7.48.2 - управление формами
- **Context API** - для локального состояния (предположительно)

### UI и стилизация
- **Tailwind CSS**: 3.3.6 - основная CSS-библиотека
- **Headless UI**: 1.7.17 - доступные компоненты
- **Heroicons**: 2.0.18 - иконки
- **Radix UI**: 1.2.3 - примитивы UI
- **Framer Motion**: 10.16.16 - анимации
- **Lucide React**: 0.294.0 - дополнительные иконки

### Редактор и контент
- **Tiptap**: 2.1.13+ - богатый текстовый редактор с расширениями:
  - Блоки кода, цитаты, таблицы
  - Сотрудничество в реальном времени
  - Цвета, подсветка, ссылки
  - Задачи и списки дел
- **React Markdown**: 9.0.1 - рендеринг markdown

### Drag & Drop
- **React DnD**: 16.0.1 - перетаскивание элементов
- **Hello Pangea DnD**: 18.0.1 - альтернативная библиотека DnD

### Сетевые запросы и WebSocket
- **Axios**: 1.6.2 - HTTP клиент
- **Socket.IO Client**: 4.7.4 - WebSocket соединения

### Сотрудничество в реальном времени
- **YJS**: 13.6.8 - CRDT для совместного редактирования

### Утилиты
- **Date-fns**: 4.1.0 - работа с датами
- **Class Variance Authority**: 0.7.1 - управление CSS классами
- **CLSX**: 2.1.1 - условные CSS классы
- **Tailwind Merge**: 3.3.1 - объединение Tailwind классов

### Тестирование
- **Jest**: через react-scripts
- **Testing Library**: 13.4.0 (React), 14.5.1 (User Event), 5.17.0 (Jest DOM)
- **Web Vitals**: 2.1.4 - метрики производительности

### Уведомления
- **React Hot Toast**: 2.4.1 - toast уведомления

## Конфигурация

### TypeScript (tsconfig.json)
- **Target**: ES2020
- **Strict mode**: включен
- **JSX**: react-jsx (новый синтаксис)
- **Module resolution**: node
- **Изоляция модулей**: включена

### ESLint (.eslintrc.js)
- **Парсер**: @typescript-eslint/parser
- **Плагины**: react, react-hooks
- **Правила**:
  - React в JSX не требуется (off)
  - PropTypes отключены (TypeScript)
  - Console.log предупреждения
  - Строгие правила для переменных и импортов

### Prettier (.prettierrc)
- **Кавычки**: одинарные
- **Точка с запятой**: да
- **Ширина строки**: 80 символов
- **Отступы**: 2 пробела

### Tailwind CSS (tailwind.config.js)
- **Темная тема**: class-based
- **Кастомные цвета**: primary (синяя палитра), gray
- **Шрифт**: Inter
- **Плагины**: @tailwindcss/forms
- **Анимации**: fade-in, slide-in

## Docker конфигурация

### Frontend контейнер
- **Базовый образ**: node:18-alpine
- **Порт**: 3000
- **Режим**: development (по умолчанию)
- **Volumes**: ./frontend:/app, /app/node_modules
- **Переменные окружения**:
  - NODE_ENV=development
  - REACT_APP_API_URL=http://localhost:8000/api
  - REACT_APP_WS_URL=ws://localhost:8000/ws

### Прокси
- **Backend прокси**: http://backend:8000 (в package.json)

## Версии Node.js
- **НЕ НАЙДЕНО**: .nvmrc, .tool-versions, engines в package.json
- **Используется**: Node 18 (из Dockerfile.frontend)

## Потенциальные проблемы

1. **Устаревший TypeScript**: 4.9.5 (текущая LTS 5.x)
2. **Дублирование DnD библиотек**: React DnD + Hello Pangea DnD
3. **Отсутствие версионирования Node.js**: нет .nvmrc
4. **Смешанные подходы к стилизации**: Tailwind + возможные inline стили
5. **Отключенная типизация**: @tailwindcss/typography закомментирована

## Рекомендации

1. Обновить TypeScript до версии 5.x
2. Выбрать одну DnD библиотеку
3. Добавить .nvmrc с версией Node.js
4. Включить @tailwindcss/typography если нужна типографика
5. Добавить engines в package.json для контроля версий
