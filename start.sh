#!/bin/bash

# Notion Clone Quick Start Script

echo "🚀 Starting Notion Clone Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cat > .env << EOF
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
EOF
fi

echo "🐳 Starting Docker containers..."
docker-compose up -d db redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "📦 Installing Python dependencies..."
if [ ! -d ".venv" ]; then
    python -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

echo "👤 Creating superuser (if needed)..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@example.com', 'admin', password='admin123') if not User.objects.filter(email='admin@example.com').exists() else None" | python manage.py shell

echo "🎨 Setting up frontend..."
if [ ! -d "frontend/node_modules" ]; then
    cd frontend
    npm install
    cd ..
fi

echo "✅ Setup complete!"
echo ""
echo "🌟 Your Notion Clone is ready!"
echo ""
echo "📖 Quick Start Commands:"
echo "  Backend:  python manage.py runserver"
echo "  Frontend: cd frontend && npm start"
echo "  Docker:   docker-compose up"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Admin:    http://localhost:8000/admin"
echo "  API Docs: http://localhost:8000/api/docs/"
echo ""
echo "🔑 Default Admin Credentials:"
echo "  Email:    admin@example.com"
echo "  Password: admin123"
echo ""
echo "Happy coding! 🎉"
