# DatabaseTable Component

Компонент таблицы базы данных с возможностью inline-редактирования, аналогичный Notion/Confluence.

## Возможности

- ✅ **Inline-редактирование ячеек** - кликните по ячейке для редактирования
- ✅ **Добавление строк** - создание новых записей в базе данных
- ✅ **Добавление колонок** - создание новых свойств с разными типами данных
- ✅ **Удаление строк/колонок** - с подтверждением удаления
- ✅ **Автосохранение** - изменения сохраняются автоматически через React Query
- ✅ **Разные типы данных** - текст, числа, даты, флажки, выбор, множественный выбор
- ✅ **Адаптивный дизайн** - работает на всех устройствах
- ✅ **TypeScript** - полная типизация

## Использование

```tsx
import { DatabaseTable } from '@/features/databases';

function MyPage() {
  return (
    <DatabaseTable 
      databaseId="your-database-id"
      className="custom-styles"
    />
  );
}
```

## Props

| Prop | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `databaseId` | `string` | ✅ | ID базы данных для отображения |
| `className` | `string` | ❌ | Дополнительные CSS классы |

## Подкомпоненты

### EditableCell
Редактируемая ячейка таблицы с поддержкой разных типов данных.

### AddRowButton
Кнопка для добавления новой строки в таблицу.

### AddColumnButton
Кнопка для добавления новой колонки с модальным окном настройки.

### DeleteButton
Кнопка удаления с модальным окном подтверждения.

## Типы данных

Компонент поддерживает следующие типы данных:

- **text** - обычный текст
- **number** - числовые значения
- **date** - даты
- **checkbox** - флажки (да/нет)
- **select** - выбор из списка
- **multi_select** - множественный выбор
- **url** - ссылки
- **email** - email адреса
- **phone** - телефонные номера

## API интеграция

Компонент использует `databasesApi` для всех операций:

- `getDatabase(id)` - получение данных базы
- `getDatabaseProperties(id)` - получение свойств
- `getDatabaseRecords(id)` - получение записей
- `createDatabaseRecord(id, data)` - создание записи
- `updateDatabaseRecord(id, recordId, data)` - обновление записи
- `deleteDatabaseRecord(id, recordId)` - удаление записи
- `createDatabaseProperty(id, data)` - создание свойства
- `deleteDatabaseProperty(id, propertyId)` - удаление свойства

## React Query

Компонент использует React Query для:

- Кеширования данных
- Автоматического обновления при изменениях
- Оптимистичных обновлений
- Обработки ошибок

## Стилизация

Компонент использует Tailwind CSS для стилизации:

- Адаптивный дизайн
- Hover эффекты
- Focus состояния
- Тени и границы
- Цветовая схема

## Тестирование

Компонент покрыт тестами с использованием:

- React Testing Library
- Jest
- Моки для API
- Тестирование всех основных сценариев

## Примеры

### Базовое использование
```tsx
<DatabaseTable databaseId="123" />
```

### С кастомными стилями
```tsx
<DatabaseTable 
  databaseId="123"
  className="shadow-xl border-2 border-blue-200"
/>
```

### В контексте страницы
```tsx
function DatabasePage() {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Моя база данных</h1>
      <DatabaseTable databaseId={id} />
    </div>
  );
}
```

## Зависимости

- React 18+
- TypeScript 4.5+
- React Query 4+
- Tailwind CSS 3+
- React Testing Library (для тестов)

## Архитектура

Компонент следует принципам Feature-Sliced Design (FSD):

```
features/databases/
├── api/           # API методы
├── hooks/         # React хуки
├── types/         # TypeScript типы
├── ui/            # UI компоненты
└── index.ts       # Главный экспорт
```

## Производительность

- Виртуализация для больших таблиц (планируется)
- Ленивая загрузка данных
- Оптимистичные обновления
- Кеширование React Query
- Мемоизация компонентов
