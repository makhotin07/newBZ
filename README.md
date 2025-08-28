# Notion Clone - Полнофункциональная платформа для работы и заметок

Современный веб-аналог Notion с поддержкой заметок, баз данных, задач, совместной работы и множественных рабочих пространств.

## 🚀 Возможности

### 📝 Заметки и контент
- **Rich-text редактор** с поддержкой Markdown и блочной структуры
- **Иерархия страниц** с drag-and-drop организацией
- **Версионирование** с историей изменений
- **Комментарии** с упоминаниями пользователей
- **Теги и категории** для организации контента
- **Шаблоны страниц** для быстрого создания

### 🗄️ Базы данных
- **Гибкие базы данных** с различными типами полей
- **Множественные представления**: таблица, доска, список, календарь, галерея
- **Фильтрация, сортировка, группировка** данных
- **Связи между базами данных**
- **Формулы и автоматические поля**

### ✅ Управление задачами
- **Kanban доски** с настраиваемыми колонками
- **Приоритеты и статусы** задач
- **Назначение исполнителей** и сроков
- **Трекинг времени** и оценка задач
- **История активности** и комментарии

### 👥 Совместная работа
- **Рабочие пространства** с разграничением доступа
- **Реальное время** редактирование
- **Система ролей**: администратор, редактор, зритель
- **Приглашения в workspace** по email
- **Публичные ссылки** для шаринга

### 🔍 Поиск и навигация
- **Полнотекстовый поиск** по всему контенту
- **Фильтры по тегам**, датам, авторам
- **Быстрая навигация** с автодополнением
- **Избранные страницы** и недавние

### 🔔 Уведомления
- **Умные уведомления** о комментариях, изменениях
- **Email и push-уведомления**
- **Напоминания** с гибкой настройкой
- **Активность в рабочих пространствах**

## 🏗️ Технологический стек

### Backend
- **Django 4.2** - основной веб-фреймворк
- **Django REST Framework** - API
- **PostgreSQL** - основная база данных
- **Redis** - кеширование и WebSocket
- **Django Channels** - WebSocket для реального времени
- **JWT Authentication** - аутентификация
- **Celery** - фоновые задачи

### Frontend
- **React 18** с TypeScript
- **React Query** - управление состоянием сервера
- **React Router** - маршрутизация
- **TailwindCSS** - стили
- **Tiptap** - rich-text редактор
- **Socket.io** - WebSocket клиент
- **React DnD** - drag and drop

### DevOps
- **Docker & Docker Compose** - контейнеризация
- **Nginx** - прокси-сервер
- **GitHub Actions** - CI/CD
- **PostgreSQL** - продакшн БД
- **Redis** - кеш и сессии

## 🚀 Быстрый старт

### Предварительные требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (опционально)

### 1. Клонирование репозитория
\`\`\`bash
git clone <repository-url>
cd newBZ
\`\`\`

### 2. Настройка Backend

#### Виртуальное окружение
\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# или
.venv\\Scripts\\activate  # Windows
\`\`\`

#### Установка зависимостей
\`\`\`bash
pip install -r requirements.txt
\`\`\`

#### Настройка окружения
Создайте \`.env\` файл:
\`\`\`env
SECRET_KEY=your-secret-key-here
DEBUG=True

DB_NAME=notion_clone
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

REDIS_URL=redis://localhost:6379

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
\`\`\`

#### Миграции и создание суперпользователя
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
\`\`\`

#### Запуск backend
\`\`\`bash
python manage.py runserver
\`\`\`

### 3. Настройка Frontend

#### Создание React приложения
\`\`\`bash
mkdir frontend
cd frontend
npx create-react-app . --template typescript
\`\`\`

#### Установка зависимостей
\`\`\`bash
npm install @tanstack/react-query react-router-dom react-markdown
npm install axios react-hook-form react-dnd react-dnd-html5-backend
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration
npm install socket.io-client framer-motion lucide-react react-hot-toast
npm install -D tailwindcss @types/react @types/react-dom
\`\`\`

#### Настройка TailwindCSS
\`\`\`bash
npx tailwindcss init -p
\`\`\`

#### Запуск frontend
\`\`\`bash
npm start
\`\`\`

## 🐳 Docker развертывание

### Развертывание для разработки
\`\`\`bash
docker-compose up --build
\`\`\`

### Продакшн развертывание
\`\`\`bash
docker-compose --profile production up -d
\`\`\`

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin панель: http://localhost:8000/admin
- API документация: http://localhost:8000/api/docs/

## 📊 Структура базы данных

### Основные модели

#### Пользователи и рабочие пространства
- \`User\` - кастомная модель пользователя
- \`Workspace\` - рабочие пространства
- \`WorkspaceMember\` - участники пространств

#### Контент
- \`Page\` - страницы/заметки
- \`Block\` - блоки контента
- \`Tag\` - теги для организации
- \`Comment\` - комментарии к страницам

#### Задачи
- \`TaskBoard\` - Kanban доски
- \`Task\` - задачи с приоритетами
- \`TaskColumn\` - колонки досок

#### Базы данных
- \`Database\` - пользовательские БД
- \`DatabaseProperty\` - поля БД
- \`DatabaseRecord\` - записи в БД
- \`DatabaseView\` - представления БД

#### Совместная работа
- \`Notification\` - уведомления
- \`ActiveSession\` - активные сессии
- \`ShareLink\` - публичные ссылки

## 🔌 API Endpoints

### Аутентификация
- \`POST /api/auth/login/\` - Вход
- \`POST /api/auth/register/\` - Регистрация
- \`POST /api/auth/token/refresh/\` - Обновление токена
- \`GET /api/auth/profile/\` - Профиль пользователя

### Рабочие пространства
- \`GET /api/workspaces/\` - Список пространств
- \`POST /api/workspaces/\` - Создание пространства
- \`GET /api/workspaces/{id}/members/\` - Участники
- \`POST /api/workspaces/{id}/invite/\` - Приглашение

### Заметки
- \`GET /api/notes/pages/\` - Список страниц
- \`POST /api/notes/pages/\` - Создание страницы
- \`GET /api/notes/pages/{id}/\` - Детали страницы
- \`PUT /api/notes/pages/{id}/\` - Обновление страницы

### Задачи
- \`GET /api/tasks/boards/\` - Kanban доски
- \`GET /api/tasks/tasks/\` - Задачи
- \`POST /api/tasks/tasks/\` - Создание задачи

### Базы данных
- \`GET /api/databases/\` - Пользовательские БД
- \`POST /api/databases/\` - Создание БД
- \`GET /api/databases/{id}/records/\` - Записи БД

## 🌐 WebSocket Events

### Совместное редактирование
- \`/ws/page/{page_id}/\` - Редактирование страниц
- \`/ws/database/{db_id}/\` - Редактирование БД
- \`/ws/workspace/{ws_id}/\` - События пространства

### События
- \`cursor_position\` - Позиция курсора
- \`text_operation\` - Операции с текстом
- \`block_operation\` - Операции с блоками
- \`record_update\` - Обновления записей БД

## 🧪 Тестирование

### Backend тесты
\`\`\`bash
python -m pytest
\`\`\`

### Frontend тесты
\`\`\`bash
cd frontend
npm test
\`\`\`

## 📝 Разработка

### Создание миграций
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

### Сборка статики
\`\`\`bash
python manage.py collectstatic
\`\`\`

### Линтинг и форматирование
\`\`\`bash
black .
isort .
\`\`\`

## 🚀 Продакшн деплой

### Настройки для продакшн
1. Установите \`DEBUG=False\`
2. Настройте базу данных PostgreSQL
3. Настройте Redis для кеширования
4. Настройте SMTP для email
5. Настройте статические файлы (S3/CDN)
6. Настройте SSL сертификаты

### Переменные окружения для продакшн
\`\`\`env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com

DATABASE_URL=postgres://user:pass@host:port/db
REDIS_URL=redis://host:port

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password

AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
\`\`\`

## 📄 Лицензия

MIT License - вы можете свободно использовать этот код для любых целей.

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи (\`git checkout -b feature/AmazingFeature\`)
3. Закоммитьте изменения (\`git commit -m 'Add some AmazingFeature'\`)
4. Запушьте в ветку (\`git push origin feature/AmazingFeature\`)
5. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте Issue в репозитории.

---

**Автор**: [Ваше имя]  
**Версия**: 1.0.0  
**Дата**: 2024
