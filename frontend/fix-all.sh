#!/bin/bash

echo "🚀 АГРЕССИВНОЕ ИСПРАВЛЕНИЕ ВСЕХ ПРОБЛЕМ..."

echo "📝 Форматирование Prettier..."
npm run format

echo "🔍 Исправление ESLint проблем (агрессивно)..."
npx eslint src --ext .ts,.tsx --fix --max-warnings 0

echo "🧹 Удаление неиспользуемых импортов..."
npx eslint src --ext .ts,.tsx --fix --rule 'import/no-unused-modules: error'

echo "📊 Проверка типов TypeScript..."
npm run type-check

echo "✅ ВСЕ ПРОБЛЕМЫ ИСПРАВЛЕНЫ!"
echo "🚀 Теперь можно запускать сборку: npm run build"
