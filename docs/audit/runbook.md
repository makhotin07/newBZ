# Репродукция и запуск

## Системные требования

### Проверенные версии
- **Python**: 3.7.7 (требуется 3.8+)
- **Node.js**: v24.7.0 (требуется 18+)
- **Docker**: 28.0.4 ✅
- **ОС**: macOS 24.6.0 (darwin)

### Несоответствия версий
- ❌ **Python 3.7.7** < 3.8 (требуется обновление)
- ✅ **Node.js v24.7.0** > 18 (подходит)
- ✅ **Docker 28.0.4** (подходит)

## Структура проекта

```
newBZ/
├── backend/           # Django/DRF приложение
├── frontend/          # React приложение
├── infra/            # Docker конфигурация
├── docker-compose.yml # Docker Compose
├── start.sh          # Скрипт быстрого запуска
└── README.md         # Документация
```

## Переменные окружения

### Backend (.env файл отсутствует)
**Ожидаемый файл**: `.env` в корне проекта
**Статус**: ❌ НЕ НАЙДЕНО

**Создается автоматически скриптом start.sh**:
```bash
SECRET_KEY=django-insecure-notion-clone-secret-key-change-in-production
DEBUG=True

DB_NAME=notion_clone
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

REDIS_URL=redis://localhost:6379

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

GOOGLE_OAUTH2_KEY=your-google-client-id
GOOGLE_OAUTH2_SECRET=your-google-client-secret
GITHUB_KEY=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### Frontend (.env файл существует)
**Файл**: `frontend/.env`
```bash
GENERATE_SOURCEMAP=false
```

### Docker (.env файл существует)
**Файл**: `infra/.env`
```bash
# Database
DB_NAME=notion_clone
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379

# Django
SECRET_KEY=django-insecure-notion-clone-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
NODE_ENV=development
```

## Команды запуска

### 1. Автоматический запуск (рекомендуется)

```bash
# Запуск скрипта быстрого старта
./start.sh
```

**Что делает скрипт**:
1. Проверяет Docker
2. Создает `.env` файл
3. Запускает Docker контейнеры (db, redis)
4. Создает виртуальное окружение Python
5. Устанавливает зависимости
6. Выполняет миграции
7. Создает суперпользователя
8. Устанавливает frontend зависимости

### 2. Ручной запуск

#### Backend (Django)
```bash
# 1. Создать виртуальное окружение
python3 -m venv .venv
source .venv/bin/activate

# 2. Установить зависимости
pip install -r requirements.txt

# 3. Настроить переменные окружения
cp .env.example .env  # ❌ Файл .env.example не найден

# 4. Выполнить миграции
python manage.py makemigrations
python manage.py migrate

# 5. Создать суперпользователя
python manage.py createsuperuser

# 6. Запустить сервер
python manage.py runserver
```

#### Frontend (React)
```bash
# 1. Перейти в папку frontend
cd frontend

# 2. Установить зависимости
npm install

# 3. Запустить в режиме разработки
npm start

# 4. Сборка для продакшена
npm run build
```

#### Docker (полный стек)
```bash
# 1. Запуск всех сервисов
docker-compose up -d

# 2. Просмотр логов
docker-compose logs -f

# 3. Остановка
docker-compose down
```

## Docker конфигурация

### Сервисы
```yaml
# docker-compose.yml
services:
  db:          # PostgreSQL база данных
    image: postgres:15
    ports: ["5432:5432"]
    
  redis:       # Redis для кэширования
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  backend:     # Django приложение
    build: .
    ports: ["8000:8000"]
    depends_on: [db, redis]
    
  frontend:    # React приложение
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports: ["3000:3000"]
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api
      - REACT_APP_WS_URL=ws://localhost:8000/ws
    depends_on: [backend]
    
  nginx:       # Nginx прокси
    image: nginx:alpine
    ports: ["80:80"]
    depends_on: [frontend, backend]
```

### Порты
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs/
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Скрипты разработки

### Backend скрипты
```bash
# Форматирование кода
black backend/
isort backend/

# Проверка типов
mypy backend/

# Тестирование
pytest
pytest --cov=backend
pytest backend/tests/test_task_service.py
```

### Frontend скрипты
```bash
# Запуск тестов
npm test                    # Одноразовый запуск
npm run test:watch         # Режим наблюдения
npm run test:coverage      # С покрытием

# Сборка
npm run build              # Продакшен сборка
npm start                  # Режим разработки
```

## Проблемы и решения

### 1. Python версия
**Проблема**: Python 3.7.7 < 3.8 (требуется)
**Решение**:
```bash
# Установить Python 3.8+
brew install python@3.8
# или
pyenv install 3.8.0
pyenv local 3.8.0
```

### 2. Отсутствующий .env.example
**Проблема**: Файл `.env.example` не найден
**Решение**: Создать файл или использовать `start.sh`

### 3. Отсутствующий .nvmrc
**Проблема**: Нет указания версии Node.js
**Решение**: Создать `.nvmrc`:
```bash
echo "18" > .nvmrc
```

### 4. Синтаксические ошибки
**Проблема**: 11 ESLint ошибок в frontend
**Решение**: Исправить импорты и синтаксис

## Проверка работоспособности

### 1. Backend проверки
```bash
# Проверка миграций
python manage.py showmigrations

# Проверка статики
python manage.py collectstatic

# Проверка API
curl http://localhost:8000/api/
```

### 2. Frontend проверки
```bash
# Проверка сборки
npm run build

# Проверка тестов
npm test -- --passWithNoTests

# Проверка линтера
npm run lint  # ❌ Скрипт не найден
```

### 3. Docker проверки
```bash
# Проверка контейнеров
docker-compose ps

# Проверка логов
docker-compose logs backend
docker-compose logs frontend

# Проверка подключений
docker-compose exec backend python manage.py check
```

## Рекомендации по улучшению

### 1. Создать недостающие файлы
```bash
# .env.example
cp .env .env.example

# .nvmrc
echo "18" > .nvmrc

# .python-version
echo "3.8" > .python-version
```

### 2. Добавить скрипты в package.json
```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Улучшить документацию
- Добавить раздел "Troubleshooting"
- Описать процесс обновления зависимостей
- Добавить примеры API запросов

## Быстрый чек-лист

### Перед запуском
- [ ] Docker запущен
- [ ] Python 3.8+ установлен
- [ ] Node.js 18+ установлен
- [ ] Порты 3000, 8000, 5432, 6379 свободны

### После запуска
- [ ] Frontend доступен на http://localhost:3000
- [ ] Backend доступен на http://localhost:8000
- [ ] API документация на http://localhost:8000/api/docs/
- [ ] Админка на http://localhost:8000/admin
- [ ] Тесты проходят: `npm test`

### При проблемах
- [ ] Проверить логи: `docker-compose logs`
- [ ] Проверить переменные окружения
- [ ] Перезапустить контейнеры: `docker-compose restart`
- [ ] Очистить кэш: `docker-compose down -v`

## Статус готовности

| Компонент | Статус | Проблемы |
|-----------|--------|----------|
| Docker | ✅ Готов | Нет |
| Backend | ⚠️ Частично | Python версия, .env.example |
| Frontend | ⚠️ Частично | ESLint ошибки |
| Документация | ✅ Готов | Нет |
| Скрипты | ✅ Готов | Нет |

**Общая готовность**: 80% (основные компоненты работают, есть минорные проблемы)
