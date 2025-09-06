# Дерево компонентов и архитектурных слоев

## Архитектурный стиль

Проект использует **Feature-Sliced Design (FSD)** - современную архитектуру для фронтенд-приложений с четким разделением по слоям и фичам.

### Структура слоев

```
src/
├── app/           # Инициализация приложения, провайдеры
├── pages/         # Страницы приложения
├── widgets/       # Крупные UI блоки
├── features/      # Бизнес-функции
├── entities/      # Бизнес-сущности
├── shared/        # Переиспользуемые ресурсы
└── processes/     # Сложные бизнес-процессы
```

## Детальный анализ слоев

### 1. App Layer (`app/`)

**Назначение**: Инициализация приложения, глобальные провайдеры

#### Компоненты:
- `AuthProvider.tsx` - Управление аутентификацией
- `ThemeProvider.tsx` - Управление темой

**Состояние**: ✅ Полностью реализован

### 2. Pages Layer (`pages/`)

**Назначение**: Страницы приложения, точки входа

#### Компоненты:
- `DashboardPage.tsx` - Главная страница
- `WorkspacePage.tsx` - Страница workspace
- `PageEditor.tsx` - Редактор страниц
- `TaskBoardPage.tsx` - Доска задач
- `DatabasePage.tsx` - База данных
- `SettingsPage.tsx` - Настройки пользователя
- `WorkspaceSettingsPage.tsx` - Настройки workspace
- `auth/LoginPage.tsx` - Вход
- `auth/RegisterPage.tsx` - Регистрация

**Особенности**:
- Все страницы используют TypeScript
- Строгая типизация пропсов
- Интеграция с React Router

**Состояние**: ✅ Полностью реализован

### 3. Widgets Layer (`widgets/`)

**Назначение**: Крупные UI блоки, композитные компоненты

#### Layout (`widgets/Layout/`):
- `Layout.tsx` - Основной макет приложения
- `Header.tsx` - Шапка приложения
- `Sidebar.tsx` - Боковая панель навигации

#### TaskBoard (`widgets/TaskBoard/`):
- `KanbanBoard.tsx` - Канбан доска
- `TaskBoardsList.tsx` - Список досок
- `TaskCard.tsx` - Карточка задачи
- `TaskModal.tsx` - Модальное окно задачи
- `CreateTaskBoardModal.tsx` - Создание доски
- `CreateTaskModal.tsx` - Создание задачи

#### DatabaseTable (`widgets/DatabaseTable/`):
- `DatabasesList.tsx` - Список баз данных
- `CreateDatabaseModal.tsx` - Создание БД
- `CreateRecordModal.tsx` - Создание записи

#### WorkspaceHeader (`widgets/WorkspaceHeader/`):
- `WorkspaceSelector.tsx` - Выбор workspace
- `WorkspaceSettings.tsx` - Настройки workspace
- `WorkspaceMembers.tsx` - Участники
- `InviteUserModal.tsx` - Приглашение пользователей
- `CreateWorkspaceModal.tsx` - Создание workspace

**Состояние**: ✅ Полностью реализован

### 4. Features Layer (`features/`)

**Назначение**: Бизнес-функции, специфичная логика

#### Auth (`features/auth/`):
- `api.ts` - API методы аутентификации
- `ui/auth/ProtectedRoute.tsx` - Защищенный роут
- `ui/auth/ForgotPasswordModal.tsx` - Восстановление пароля

#### Notes (`features/notes/`):
- `api.ts` - API методы заметок
- `ui/editor/` - Редактор с Tiptap
  - `RichTextEditor.tsx` - Основной редактор
  - `EditorToolbar.tsx` - Панель инструментов
  - `EditorBubbleMenu.tsx` - Контекстное меню
  - `EditorFloatingMenu.tsx` - Плавающее меню
  - `SlashCommands.tsx` - Слэш-команды
  - `AutoSaveIndicator.tsx` - Индикатор автосохранения
- `ui/pages/` - Компоненты страниц
  - `PageList.tsx` - Список страниц
  - `PageEditor.tsx` - Редактор страницы
  - `PagePreview.tsx` - Предпросмотр
  - `SharePageModal.tsx` - Шаринг страницы

#### Databases (`features/databases/`):
- `api.ts` - API методы БД
- `hooks/` - Хуки для работы с БД
- `types/` - TypeScript типы
- `ui/` - UI компоненты БД
  - `DatabaseTable.tsx` - Таблица БД
  - `CreatePropertyModal.tsx` - Создание свойства
  - `views/` - Различные представления
    - `TableView.tsx` - Табличное представление
    - `BoardView.tsx` - Канбан представление
    - `CalendarView.tsx` - Календарное представление
    - `GalleryView.tsx` - Галерейное представление

#### Tasks (`features/tasks/`):
- `api.ts` - API методы задач
- `types/` - TypeScript типы
- `ui/` - UI компоненты задач

#### Workspaces (`features/workspaces/`):
- `api.ts` - API методы workspace
- `types/` - TypeScript типы
- `ui/` - UI компоненты workspace

#### Comments (`features/comments/`):
- `api/` - API методы комментариев
- `ui/CommentsPanel.tsx` - Панель комментариев

#### Search (`features/search/`):
- `api.ts` - API методы поиска
- `ui/search/` - UI компоненты поиска
  - `GlobalSearch.tsx` - Глобальный поиск
  - `SearchResultItem.tsx` - Элемент результата

#### Notifications (`features/notifications/`):
- `api.ts` - API методы уведомлений
- `ui/notifications/NotificationPanel.tsx` - Панель уведомлений

**Состояние**: ✅ Полностью реализован

### 5. Entities Layer (`entities/`)

**Назначение**: Бизнес-сущности, доменные модели

#### Структура:
- `database/` - Сущность базы данных
- `page/` - Сущность страницы
- `task/` - Сущность задачи
- `user/` - Сущность пользователя
- `workspace/` - Сущность workspace

**Проблема**: Папки существуют, но **НЕ НАЙДЕНО** содержимого в большинстве из них

**Состояние**: ❌ Не реализован (пустые папки)

### 6. Shared Layer (`shared/`)

**Назначение**: Переиспользуемые ресурсы

#### API (`shared/api/`):
- `api.ts` - Основной API клиент
- `sdk/` - Автогенерированный SDK
  - `generated/` - Сгенерированные типы и сервисы
  - `index.ts` - Экспорт SDK

#### Hooks (`shared/hooks/`):
- `useAuth.ts` - Хук аутентификации
- `useDatabases.ts` - Хук для БД
- `useNotes.ts` - Хук для заметок
- `useTasks.ts` - Хук для задач
- `useWorkspaces.ts` - Хук для workspace
- `useSearch.ts` - Хук поиска
- `useNotifications.ts` - Хук уведомлений
- `useCollaboration.ts` - Хук сотрудничества
- `useDebounce.ts` - Хук дебаунса
- `useDrawer.ts` - Хук drawer
- `useSidePanel.ts` - Хук боковой панели
- `useMemoization.ts` - Хук мемоизации
- `usePageContent.ts` - Хук контента страницы

#### UI (`shared/ui/`):
- `Button.tsx` - Кнопка
- `Input.tsx` - Поле ввода
- `Textarea.tsx` - Текстовое поле
- `Modal.tsx` - Модальное окно
- `Drawer.tsx` - Выдвижная панель
- `SidePanel.tsx` - Боковая панель
- `LoadingSpinner.tsx` - Спиннер загрузки
- `LoadingSkeleton.tsx` - Скелетон загрузки
- `ErrorState.tsx` - Состояние ошибки
- `EmptyState.tsx` - Пустое состояние
- `ErrorBoundary.tsx` - Граница ошибок
- `Tooltip.tsx` - Подсказка
- `ConfirmModal.tsx` - Модальное подтверждение
- `TagSelector.tsx` - Селектор тегов
- `EmojiPicker.tsx` - Выбор эмодзи
- `ThemeProvider.tsx` - Провайдер темы
- `ThemeToggle.tsx` - Переключатель темы

#### Types (`shared/types/`):
- `index.ts` - Общие типы

#### Utils (`shared/utils/`):
- `index.ts` - Утилиты
- `cn.ts` - Утилита для классов
- `LazyLoader.tsx` - Ленивая загрузка

#### Extensions (`shared/extensions/`):
- `DatabaseExtension.ts` - Расширение для БД
- `DragAndDrop.ts` - Drag & Drop
- `index.ts` - Экспорт расширений

#### Analytics (`shared/analytics/`):
- `PerformanceMonitor.tsx` - Монитор производительности
- `index.ts` - Экспорт аналитики

#### Config (`shared/config/`):
- `locales/ru.ts` - Русская локализация

**Состояние**: ✅ Полностью реализован

### 7. Processes Layer (`processes/`)

**Назначение**: Сложные бизнес-процессы

#### Структура:
- `auth/` - Процесс аутентификации
- `collaboration/` - Процесс сотрудничества
- `workspace-creation/` - Процесс создания workspace

**Проблема**: Папки существуют, но **НЕ НАЙДЕНО** содержимого

**Состояние**: ❌ Не реализован (пустые папки)

## Ключевые компоненты

### RichTextEditor
- **Расположение**: `features/notes/ui/editor/RichTextEditor.tsx`
- **Функционал**: Богатый текстовый редактор на Tiptap
- **Особенности**:
  - Slash-команды
  - Drag & Drop
  - Автосохранение
  - Сотрудничество в реальном времени
  - Расширения для БД
- **Состояние**: ✅ Полностью реализован

### DatabaseTable
- **Расположение**: `features/databases/ui/DatabaseTable.tsx`
- **Функционал**: Таблица базы данных
- **Особенности**:
  - Редактирование ячеек
  - Добавление строк/столбцов
  - Различные представления
- **Состояние**: ✅ Полностью реализован

### Layout
- **Расположение**: `widgets/Layout/Layout.tsx`
- **Функционал**: Основной макет приложения
- **Особенности**:
  - Sidebar навигация
  - Header с пользователем
  - Outlet для страниц
- **Состояние**: ✅ Полностью реализован

## Дублирование кода

### Найденные дублирования:

1. **Модальные окна создания**:
   - `widgets/TaskBoard/CreateTaskModal.tsx`
   - `widgets/TaskBoard/CreateTaskModal.tsx.backup` - **ДУБЛИКАТ**

2. **Компоненты страниц**:
   - `pages/PageEditor.tsx`
   - `features/notes/ui/pages/PageEditor.tsx` - **ПОТЕНЦИАЛЬНОЕ ДУБЛИРОВАНИЕ**

3. **API методы**:
   - `features/*/api.ts` - Множественные файлы с похожей структурой

## Проблемы архитектуры

### 1. Пустые слои
- **Entities**: Папки существуют, но пустые
- **Processes**: Папки существуют, но пустые

### 2. Нарушение FSD
- **Pages импортируют из features**: `pages/PageEditor.tsx` импортирует из `features/notes/ui/pages/PageEditor.tsx`
- **Widgets импортируют из features**: `widgets/Layout/Sidebar.tsx` импортирует из `features/workspaces/ui/auth/ProtectedRoute`

### 3. Отсутствие четкого разделения
- **API методы разбросаны**: В `features/*/api.ts` и `shared/api/`
- **Типы дублируются**: В `features/*/types/` и `shared/types/`

## Рекомендации

### 1. Заполнить пустые слои
- Перенести доменные модели в `entities/`
- Реализовать бизнес-процессы в `processes/`

### 2. Исправить импорты
- Следовать правилам FSD: слои могут импортировать только из нижележащих
- Вынести общие компоненты в `shared/`

### 3. Убрать дублирование
- Удалить `.backup` файлы
- Объединить дублирующиеся API методы
- Создать единую систему типов

### 4. Улучшить структуру
- Создать четкие границы между слоями
- Добавить barrel exports (`index.ts`) во все папки
- Документировать архитектурные решения

## Состояние реализации

| Слой | Статус | Проблемы |
|------|--------|----------|
| App | ✅ Готов | - |
| Pages | ✅ Готов | Нарушение FSD |
| Widgets | ✅ Готов | Нарушение FSD |
| Features | ✅ Готов | Дублирование API |
| Entities | ❌ Пустой | Нет содержимого |
| Shared | ✅ Готов | - |
| Processes | ❌ Пустой | Нет содержимого |

**Общая оценка**: 71% готовности (5 из 7 слоев)
