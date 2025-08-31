# 🗺️ Карта проекта - Аудит репозитория

## 📁 Структура проекта верхнего уровня

```
newBZ/
├── frontend/                 # React + TypeScript фронтенд
├── backend/                  # Django + DRF бэкенд
├── infra/                    # Инфраструктура и Docker
├── docs/                     # Документация (создана для аудита)
├── logs/                     # Логи приложения
├── media/                    # Медиа файлы
├── staticfiles/              # Статические файлы Django
├── .venv/                    # Python виртуальное окружение
├── docker-compose.yml        # Основной Docker Compose
├── Dockerfile                # Dockerfile для бэкенда
├── Dockerfile.frontend       # Dockerfile для фронтенда
├── nginx.conf                # Конфигурация Nginx
├── requirements.txt          # Python зависимости
├── pyproject.toml           # Python конфигурация
├── package.json              # Node.js зависимости (корневой)
├── start.sh                  # Скрипт запуска
└── README.md                 # Документация проекта
```

## 🚀 Ключевые технологии

### Frontend
- **React 18.2.0** - Основной фреймворк
- **TypeScript 4.9.5** - Типизация
- **Tailwind CSS 3.3.6** - CSS фреймворк
- **React Router DOM 6.18.0** - Маршрутизация
- **@tanstack/react-query 5.85.5** - Управление состоянием и API
- **Framer Motion 10.16.16** - Анимации
- **TipTap 2.1.13** - Rich text редактор (аналог Notion)

### Backend
- **Django 4.2.7** - Основной фреймворк
- **Django REST Framework 3.14.0** - API
- **Channels 4.0.0** - WebSocket поддержка
- **Redis 5.0.1** - Кэширование и сессии
- **PostgreSQL** - Основная база данных
- **Celery** - Асинхронные задачи

### Инфраструктура
- **Docker & Docker Compose** - Контейнеризация
- **Nginx** - Веб-сервер и прокси
- **Redis** - Кэш и WebSocket backend
- **PostgreSQL** - База данных

## 🏗️ Архитектура проекта

### Frontend (Feature-Sliced Design)
```
frontend/src/
├── app/                      # Провайдеры и глобальные настройки
├── pages/                    # Страницы приложения
├── widgets/                  # Сложные UI блоки
├── features/                 # Бизнес-функции
├── shared/                   # Общие компоненты и утилиты
└── components/               # Переиспользуемые компоненты
```

### Backend (Clean Architecture)
```
backend/
├── apps/                     # Django приложения
├── api/                      # API контроллеры
├── services/                 # Бизнес-логика
├── core/                     # Ядро и настройки
└── tests/                    # Тесты
```

## 🛣️ Маршруты и API

### Frontend маршруты (React Router)
- `/` - Главная страница (Dashboard)
- `/login`, `/register` - Аутентификация
- `/workspace/:workspaceId` - Рабочее пространство
- `/workspace/:workspaceId/page/:pageId` - Редактор страниц
- `/workspace/:workspaceId/tasks/:boardId` - Доска задач
- `/workspace/:workspaceId/database/:databaseId` - База данных
- `/settings` - Настройки пользователя

### Backend API (DRF)
- `/api/auth/*` - Аутентификация и пользователи
- `/api/workspaces/*` - Рабочие пространства
- `/api/notes/pages/*` - Страницы и заметки
- `/api/taskboards/*` - Доски задач
- `/api/databases/*` - Базы данных
- `/api/search/*` - Поиск
- `/api/notifications/*` - Уведомления

## 🎨 UI/UX компоненты

### Основные UI библиотеки
- **@headlessui/react** - Доступные UI компоненты
- **@heroicons/react** - Иконки
- **@tailwindcss/forms** - Стили для форм
- **@tailwindcss/typography** - Типографика (временно отключено)

### Кастомные компоненты
- **shared/ui/** - Переиспользуемые UI компоненты
- **widgets/** - Сложные UI блоки
- **components/** - Базовые компоненты

## 🔧 Конфигурация

### Frontend
- **ESLint** - Линтинг (встроен в react-scripts)
- **Prettier** - Форматирование кода
- **Tailwind** - CSS фреймворк с кастомной палитрой
- **TypeScript** - Строгая типизация

### Backend
- **Black** - Форматирование Python кода
- **isort** - Сортировка импортов
- **mypy** - Статическая типизация
- **pytest** - Тестирование

## 📊 Текущее состояние

### ✅ Реализовано
- Базовая архитектура FSD + Clean Architecture
- Аутентификация и авторизация
- WebSocket поддержка
- Rich text редактор (TipTap)
- Drag & Drop для задач
- Система уведомлений
- Поиск по контенту
- API документация (drf-spectacular)

### 🔄 В разработке
- Side-panel компоненты
- Улучшенный UX для страниц
- Расширенная система комментариев

### 📋 Планируется (редизайн)
- Полноценный side-panel как в Notion
- Улучшенная навигация
- Современный дизайн-система
- Расширенные возможности редактирования
- Лучшая мобильная поддержка

## 🎯 Цели редизайна

1. **UX/UI модернизация** - переход к современному дизайну
2. **Side-panel архитектура** - аналог Notion/Confluence
3. **Улучшенная навигация** - интуитивное перемещение между разделами
4. **Консистентный дизайн** - единая система компонентов
5. **Мобильная адаптация** - поддержка всех устройств
6. **Производительность** - оптимизация рендеринга и API
