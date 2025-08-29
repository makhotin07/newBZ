# Notion Clone - Backend

Backend приложения для совместной работы, построенный на Django с использованием Clean Architecture.

## 🏗️ Архитектура

Проект следует принципам Clean Architecture и разделен на следующие слои:

```
backend/
├── apps/           # Доменные модули (модели, сериалайзеры)
├── services/       # Бизнес-логика и use-cases
├── api/           # Контроллеры (ViewSets, Consumers)
├── core/          # Общие настройки, middleware, utils
├── tests/         # Тесты для всех слоев
├── settings.py    # Конфигурация Django
├── urls.py        # Главные URL-маршруты
└── manage.py      # Django management
```

### Слои архитектуры:

- **apps/** - Доменные сущности, модели, DTO (serializers)
- **services/** - Бизнес-логика, use-cases, Celery задачи
- **api/** - Контроллеры, ViewSets, WebSocket consumers
- **core/** - Общие настройки, middleware, исключения, утилиты
- **tests/** - Unit и интеграционные тесты

## 🚀 Быстрый старт

### Требования

- Python 3.8+
- PostgreSQL
- Redis

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd newBZ
```

2. Создайте виртуальное окружение:
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env файл
```

5. Выполните миграции:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Создайте суперпользователя:
```bash
python manage.py createsuperuser
```

7. Запустите сервер:
```bash
python manage.py runserver
```

## 🔧 Разработка

### Форматирование кода

Проект использует автоматическое форматирование:

```bash
# Форматирование с Black
black backend/

# Сортировка импортов с isort
isort backend/

# Проверка типов с mypy
mypy backend/
```

### Тестирование

```bash
# Запуск всех тестов
pytest

# Запуск тестов с покрытием
pytest --cov=backend

# Запуск тестов конкретного модуля
pytest backend/tests/test_task_service.py
```

### Структура тестов

```
backend/tests/
├── test_task_service.py      # Тесты сервиса задач
├── test_note_service.py      # Тесты сервиса заметок
├── test_workspace_service.py # Тесты сервиса workspace
└── test_search_service.py    # Тесты сервиса поиска
```

## 📚 API Endpoints

### Задачи
- `GET /api/tasks/taskboards/` - Список досок задач
- `POST /api/tasks/taskboards/` - Создание доски
- `GET /api/tasks/tasks/` - Список задач
- `POST /api/tasks/tasks/` - Создание задачи

### Заметки
- `GET /api/notes/pages/` - Список страниц
- `POST /api/notes/pages/` - Создание страницы
- `GET /api/notes/tags/` - Список тегов

### Рабочие пространства
- `GET /api/workspaces/workspaces/` - Список workspace
- `POST /api/workspaces/workspaces/` - Создание workspace
- `POST /api/workspaces/workspaces/{id}/invite/` - Приглашение пользователя

### Поиск
- `POST /api/search/search/search/` - Поиск по контенту
- `GET /api/search/search/autocomplete/` - Автодополнение

## 🔌 WebSocket

WebSocket endpoints для совместной работы в реальном времени:

```
ws://localhost:8000/ws/collaboration/{workspace_id}/{resource_type}/{resource_id}/
```

Поддерживаемые типы ресурсов:
- `page` - Страницы заметок
- `database` - Базы данных
- `task` - Задачи

## 🐳 Docker

Запуск с Docker:

```bash
docker-compose up -d
```

## 📝 Принципы разработки

1. **Разделение ответственности** - каждый слой имеет свою зону ответственности
2. **Dependency Inversion** - зависимости направлены от внешних слоев к внутренним
3. **Тестируемость** - бизнес-логика легко тестируется
4. **Масштабируемость** - код легко расширяется новыми функциями
5. **Поддерживаемость** - четкая структура упрощает поддержку

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.
