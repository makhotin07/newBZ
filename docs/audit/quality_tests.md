# Качество кода, тесты и статанализ

## ESLint и форматирование

### Конфигурация ESLint
**Файл**: `frontend/.eslintrc.js`

```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    '@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'warn',  // ← Предупреждение для console.log
    'no-unused-vars': 'off',  // ← Отключено в пользу @typescript-eslint/no-unused-vars
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### Конфигурация Prettier
**Файл**: `frontend/.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Текущие ESLint ошибки (11 ошибок)

#### Критичные ошибки импорта (P0)
```typescript
// frontend/src/features/notes/api.ts:5:31
import { BlockTypeEnum } from '../../shared/api/sdk/generated/models/BlockTypeEnum';
// ❌ Cannot find module '../../shared/api/sdk/generated/models/BlockTypeEnum'

// frontend/src/shared/api/sdk/index.ts:5:25
import * as generated from './generated';
// ❌ Cannot find module './generated'
```

**Проблема**: Отсутствуют сгенерированные файлы SDK
**Исправление**: Сгенерировать SDK из OpenAPI схемы

## TypeScript покрытие

### Конфигурация TypeScript
**Файл**: `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,  // ← Строгий режим включен
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### Покрытие типов
- ✅ **Строгий режим**: включен
- ✅ **Строгая типизация**: большинство компонентов типизированы
- ⚠️ **any типы**: встречаются в API клиентах
- ❌ **Сгенерированные типы**: отсутствуют (SDK не сгенерирован)

## Тестирование

### Тестовые фреймворки
- **Jest**: 29.7.0 (через react-scripts)
- **React Testing Library**: 13.4.0
- **@testing-library/jest-dom**: 5.17.0

### Статистика тестов
```
Test Suites: 8 failed, 3 passed, 11 total
Tests:       28 failed, 68 passed, 96 total
Snapshots:   0 total
```

### Покрытие тестами

#### ✅ Работающие тесты (68 тестов)
1. **Button компонент** (`shared/ui/Button.test.tsx`)
   - 17 тестов: рендеринг, варианты, размеры, состояния
   - ✅ Полное покрытие всех пропсов и состояний

2. **Layout компонент** (`__tests__/components/Layout/Layout.test.tsx`)
   - 3 теста: рендеринг, структура, outlet
   - ✅ Базовое покрытие

3. **useAuth хук** (`__tests__/hooks/useAuth.test.ts`)
   - 5 тестов: инициализация, localStorage, logout, функции
   - ✅ Покрытие основного функционала

4. **Input компонент** (`shared/ui/Input.test.tsx`)
   - 8 тестов: рендеринг, валидация, состояния
   - ✅ Хорошее покрытие

5. **Modal компонент** (`shared/ui/Modal.test.tsx`)
   - 6 тестов: рендеринг, события, accessibility
   - ✅ Базовое покрытие

6. **Textarea компонент** (`shared/ui/Textarea.test.tsx`)
   - 4 теста: рендеринг, валидация
   - ✅ Базовое покрытие

#### ❌ Падающие тесты (28 тестов)

1. **CommentsPanel** (`features/comments/ui/CommentsPanel.test.tsx`)
   - 6 падающих тестов
   - **Проблема**: Тесты ожидают состояния загрузки/ошибки, но компонент всегда показывает пустое состояние
   - **Причина**: API методы заглушены

2. **PageDrawer** (`widgets/TaskBoard/PageDrawer.test.tsx`)
   - 2 падающих теста
   - **Проблема**: Дублирование текста "Test Page" в заголовке и контенте
   - **Исправление**: Использовать `getAllByText` или более специфичные селекторы

3. **DatabaseTable** (`features/databases/ui/DatabaseTable.test.tsx`)
   - 20 падающих тестов
   - **Проблема**: Моки не настроены правильно, компонент не рендерится

### Тестовые утилиты

#### `setupTests.ts`
```typescript
// ✅ Хорошо настроен
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Настройка тестовой среды
configure({ testIdAttribute: 'data-testid' });

// Моки для window.location
const mockLocation = {
  href: 'http://localhost',
  origin: 'http://localhost',
  // ...
};
```

#### `testUtils.tsx`
```typescript
// ✅ Полезные утилиты
export const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            {ui}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </QueryClientProvider>
  );
};
```

## Доступность (a11y)

### ARIA атрибуты
**Найдено**: 419 совпадений в 55 файлах

#### ✅ Хорошие примеры
```typescript
// Button компонент
<button
  aria-label="Test button"
  aria-disabled="true"
  aria-busy="true"
>
  Loading
</button>

// Modal компонент
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Modal Title</h2>
</div>
```

#### ⚠️ Проблемы доступности
1. **Отсутствующие aria-label**:
   - Кнопки в DatabasePage без описания
   - Иконки без текстового описания

2. **Неправильная структура заголовков**:
   - PageDrawer имеет дублирующиеся h1 и h2 с одинаковым текстом

3. **Отсутствующие роли**:
   - Некоторые интерактивные элементы без role

## Интернационализация (i18n)

### Текущее состояние
**Найдено**: 793 совпадения с "i18n" в 108 файлах

#### ❌ Отсутствует i18n
- Нет библиотеки интернационализации (react-i18next, i18next)
- Все тексты захардкожены на русском языке
- Нет системы переводов

#### Примеры захардкоженных текстов
```typescript
// frontend/src/pages/DashboardPage.tsx
<h1 className="text-2xl font-bold text-gray-900">Добро пожаловать!</h1>
<p className="text-gray-600">Выберите действие для начала работы</p>

// frontend/src/features/comments/ui/CommentsPanel.tsx
<h3 className="text-lg font-medium text-gray-900">Комментарии</h3>
<p>Пока нет комментариев</p>
```

## Качество кода

### Положительные аспекты
1. **TypeScript**: Строгая типизация в большинстве компонентов
2. **ESLint**: Настроен с разумными правилами
3. **Prettier**: Единообразное форматирование
4. **Тесты**: Базовое покрытие UI компонентов
5. **Архитектура**: Следует FSD принципам

### Проблемные области
1. **Сгенерированный SDK**: Отсутствует, вызывает ошибки импорта
2. **API заглушки**: Множество методов не реализованы
3. **Тесты**: 29% падают из-за заглушек
4. **i18n**: Полностью отсутствует
5. **a11y**: Неполное покрытие accessibility атрибутов

## Рекомендации по улучшению

### Критичные (P0)
1. **Сгенерировать SDK**:
   ```bash
   # Сгенерировать из OpenAPI схемы
   npx @openapitools/openapi-generator-cli generate \
     -i schema.yaml \
     -g typescript-axios \
     -o src/shared/api/sdk/generated
   ```

2. **Исправить падающие тесты**:
   - Заменить заглушки в CommentsPanel тестах
   - Исправить дублирование в PageDrawer тестах
   - Настроить моки для DatabaseTable

### Важные (P1)
1. **Добавить i18n**:
   ```bash
   npm install react-i18next i18next i18next-browser-languagedetector
   ```

2. **Улучшить accessibility**:
   - Добавить aria-label для всех интерактивных элементов
   - Исправить структуру заголовков
   - Добавить роли для сложных компонентов

3. **Увеличить покрытие тестами**:
   - Добавить тесты для API хуков
   - Покрыть edge cases в компонентах
   - Добавить интеграционные тесты

### Улучшения (P2)
1. **Добавить E2E тесты**:
   ```bash
   npm install --save-dev playwright
   ```

2. **Настроить покрытие кода**:
   ```bash
   npm install --save-dev @testing-library/jest-dom
   ```

3. **Добавить линтеры**:
   ```bash
   npm install --save-dev eslint-plugin-jsx-a11y
   ```

## Метрики качества

| Метрика | Значение | Статус |
|---------|----------|--------|
| ESLint ошибки | 11 | ❌ Критично |
| TypeScript ошибки | 11 | ❌ Критично |
| Покрытие тестами | 71% (68/96) | ⚠️ Средне |
| Падающие тесты | 29% (28/96) | ❌ Плохо |
| ARIA атрибуты | 419 | ✅ Хорошо |
| i18n поддержка | 0% | ❌ Отсутствует |
| Сгенерированный SDK | 0% | ❌ Отсутствует |

**Общая оценка качества**: 6/10 (много критичных проблем, но хорошая архитектура)
