# План миграции URL (P0-20)

## Файлы для изменения на бэкенде

### backend/api/urls.py
- **Строки 95-97**: Заменить `/notification-settings/` на `/notifications/settings/`
- **Строки 98-100**: Заменить `/reminders/` на `/notifications/reminders/`
- **Строки 110-112**: Заменить `/search/history/` на `/search/history/` (уже правильно)
- **Строки 113-115**: Заменить `/search/saved/` на `/search/saved/` (уже правильно)
- **Строки 120-125**: Заменить `/notes/pages/{page_id}/comments/` на `/pages/{page_id}/comments/`
- **Строки 126-130**: Заменить `/notes/pages/{page_id}/comments/{pk}/` на `/pages/{page_id}/comments/{pk}/`
- **Строки 131-135**: Заменить `/notes/pages/{page_id}/comments/{pk}/resolve/` на `/pages/{page_id}/comments/{pk}/resolve/`
- **Строки 70-75**: Заменить `/notes/pages/` на `/pages/`
- **Строки 76-80**: Заменить `/notes/tags/` на `/tags/`
- **Строки 81-85**: Заменить `/notes/blocks/` на `/pages/{id}/blocks/`
- **Строки 90-95**: Заменить `/workspaces/invitations/` на `/workspaces/{id}/invitations/`
- **Строки 100-105**: Заменить `/workspaces/analytics/` на `/workspaces/{id}/analytics/`
- **Строки 60-65**: Заменить `/taskboards/` на `/boards/`
- **Строки 65-70**: Заменить `/tasks/` на `/tasks/` (оставить как есть)

### backend/api/note_views.py
- **Строки 71-75**: Заменить `@action` для `/share/` на nested URL

### backend/api/search_views.py
- **Строки 21-25**: Заменить `@action` для `/search/` на основной endpoint
- **Строки 43-47**: Заменить `@action` для `/suggestions/` на `/search/suggestions/`
- **Строки 59-63**: Заменить `@action` для `/global/` на `/search/global/`
- **Строки 80-84**: Заменить `@action` для `/workspace/{workspace_id}/` на `/search/workspace/{workspace_id}/`
- **Строки 121-125**: Заменить `@action` для `/clear/` на `/search/history/clear/`
- **Строки 159-163**: Заменить `@action` для `/execute/` на `/search/saved/{id}/execute/`

### backend/api/workspace_views.py
- **Строки 53-57**: Заменить `@action` для `/members/` на nested URL
- **Строки 62-66**: Заменить `@action` для `/members/me/` на nested URL
- **Строки 74-78**: Заменить `@action` для `/members/me/` на nested URL
- **Строки 83-87**: Заменить `@action` для `/invite/` на nested URL
- **Строки 102-106**: Заменить `@action` для `/settings/` на nested URL
- **Строки 122-126**: Заменить `@action` для `/members/{member_id}/` на nested URL
- **Строки 137-141**: Заменить `@action` для `/members/{member_id}/` на nested URL
- **Строки 148-152**: Заменить `@action` для `/analytics/` на nested URL
- **Строки 158-162**: Заменить `@action` для `/task-stats/` на nested URL
- **Строки 179-183**: Заменить `@action` для `/invitations/` на nested URL
- **Строки 190-194**: Заменить `@action` для `/accept/` на nested URL
- **Строки 214-218**: Заменить `@action` для `/accept/` на nested URL
- **Строки 231-235**: Заменить `@action` для `/decline/` на nested URL

### backend/api/workspace_analytics_views.py
- **Строки 32-36**: Заменить `@action` для `/overview/` на nested URL

### backend/api/database_views.py
- **Строки 57-61**: Заменить `@action` для `/records/` на nested URL
- **Строки 62-66**: Заменить `@action` для `/records/` на nested URL
- **Строки 75-79**: Заменить `@action` для `/properties/` на nested URL
- **Строки 81-85**: Заменить `@action` для `/properties/` на nested URL
- **Строки 94-98**: Заменить `@action` для `/views/` на nested URL
- **Строки 99-103**: Заменить `@action` для `/views/` на nested URL
- **Строки 133-137**: Заменить `@action` для `/export/` на nested URL
- **Строки 139-143**: Заменить `@action` для `/import/` на nested URL
- **Строки 145-149**: Заменить `@action` для `/import/` на nested URL

### backend/api/taskboard_views.py
- **Строки 59-63**: Заменить `@action` для `/columns/` на nested URL
- **Строки 82-86**: Заменить `@action` для `/tasks/` на nested URL
- **Строки 212-216**: Заменить `@action` для `/reorder/` на PATCH endpoint
- **Строки 234-238**: Заменить `@action` для `/comments/` на nested URL
- **Строки 245-249**: Заменить `@action` для `/activity/` на nested URL

## Файлы для изменения на фронтенде

### frontend/src/features/notifications/api.ts
- **Строки 129-133**: Заменить `/notification-settings/` на `/notifications/settings/`
- **Строки 149-153**: Заменить `/reminders/` на `/notifications/reminders/`

### frontend/src/features/search/api.ts
- **Строки 156-160**: Заменить `/search-history/` на `/search/history/`
- **Строки 167-171**: Заменить `/search-history/clear/` на `/search/history/clear/`
- **Строки 173-177**: Заменить `/search-history/{id}/` на `/search/history/{id}/`
- **Строки 178-182**: Заменить `/saved-searches/` на `/search/saved/`
- **Строки 185-189**: Заменить `/saved-searches/` на `/search/saved/`
- **Строки 190-194**: Заменить `/saved-searches/{id}/` на `/search/saved/{id}/`
- **Строки 195-199**: Заменить `/saved-searches/{id}/` на `/search/saved/{id}/`
- **Строки 199-203**: Заменить `/saved-searches/{id}/execute/` на `/search/saved/{id}/execute/`

### frontend/src/features/notes/api.ts
- **Строки 90-94**: Заменить `/notes/tags/` на `/tags/`
- **Строки 105-109**: Заменить `/notes/tags/` на `/tags/`
- **Строки 110-114**: Заменить `/notes/tags/{id}/` на `/tags/{id}/`
- **Строки 115-119**: Заменить `/notes/tags/{id}/` на `/tags/{id}/`
- **Строки 126-130**: Заменить `/notes/pages/` на `/pages/`
- **Строки 141-145**: Заменить `/notes/pages/{id}/` на `/pages/{id}/`
- **Строки 157-161**: Заменить `/notes/pages/` на `/pages/`
- **Строки 173-177**: Заменить `/notes/pages/{id}/` на `/pages/{id}/`
- **Строки 178-182**: Заменить `/notes/pages/{id}/` на `/pages/{id}/`
- **Строки 184-188**: Заменить `/notes/pages/{pageId}/blocks/` на `/pages/{pageId}/blocks/`
- **Строки 204-208**: Заменить `/notes/pages/{pageId}/blocks/` на `/pages/{pageId}/blocks/`
- **Строки 213-217**: Заменить `/notes/blocks/{blockId}/` на `/blocks/{blockId}/`
- **Строки 218-222**: Заменить `/notes/blocks/{blockId}/` на `/blocks/{blockId}/`
- **Строки 251-255**: Заменить `/notes/workspace/{workspaceId}/recent/` на `/workspaces/{workspaceId}/pages/recent/`
- **Строки 262-266**: Заменить `/notes/pages/{data.page_id}/share/` на `/pages/{data.page_id}/share/`

### frontend/src/features/tasks/api.ts
- **Строки 113-117**: Заменить `/taskboards/` на `/boards/`
- **Строки 128-132**: Заменить `/taskboards/{id}/` на `/boards/{id}/`
- **Строки 133-137**: Заменить `/taskboards/` на `/boards/`
- **Строки 138-142**: Заменить `/taskboards/{id}/` на `/boards/{id}/`
- **Строки 143-147**: Заменить `/taskboards/{id}/` на `/boards/{id}/`
- **Строки 148-152**: Заменить `/taskboards/{boardId}/columns/` на `/boards/{boardId}/columns/`
- **Строки 163-167**: Заменить `/taskboards/{boardId}/columns/` на `/boards/{boardId}/columns/`
- **Строки 168-172**: Заменить `/taskboards/columns/{columnId}/` на `/boards/columns/{columnId}/`
- **Строки 173-177**: Заменить `/taskboards/columns/{columnId}/` на `/boards/columns/{columnId}/`
- **Строки 183-187**: Заменить `/taskboards/{boardId}/tasks/` на `/boards/{boardId}/tasks/`
- **Строки 204-208**: Заменить `/tasks/` на `/tasks/` (оставить как есть)
- **Строки 219-223**: Заменить `/tasks/{id}/` на `/tasks/{id}/` (оставить как есть)
- **Строки 224-228**: Заменить `/tasks/` на `/tasks/` (оставить как есть)
- **Строки 229-233**: Заменить `/tasks/{id}/` на `/tasks/{id}/` (оставить как есть)
- **Строки 234-238**: Заменить `/tasks/{id}/` на `/tasks/{id}/` (оставить как есть)
- **Строки 238-242**: Заменить `/tasks/{id}/move/` на `/tasks/{id}/` (PATCH)
- **Строки 245-249**: Заменить `/tasks/{taskId}/activity/` на `/tasks/{taskId}/activity/`
- **Строки 263-267**: Заменить `/workspaces/{workspaceId}/task-stats/` на `/workspaces/{workspaceId}/task-stats/`

### frontend/src/features/databases/api.ts
- **Все вызовы**: Заменить `/databases/{id}/properties/` на `/databases/{id}/properties/` (оставить как есть)
- **Все вызовы**: Заменить `/databases/{id}/records/` на `/databases/{id}/records/` (оставить как есть)
- **Все вызовы**: Заменить `/databases/{id}/views/` на `/databases/{id}/views/` (оставить как есть)

### frontend/src/features/workspaces/api.ts
- **Все вызовы**: Заменить `/workspaces/{id}/members/` на `/workspaces/{id}/members/` (оставить как есть)
- **Все вызовы**: Заменить `/workspaces/{id}/invite/` на `/workspaces/{id}/invite/` (оставить как есть)
- **Все вызовы**: Заменить `/workspaces/{id}/settings/` на `/workspaces/{id}/settings/` (оставить как есть)
- **Все вызовы**: Заменить `/workspaces/{id}/analytics/` на `/workspaces/{id}/analytics/` (оставить как есть)
- **Все вызовы**: Заменить `/workspaces/analytics/overview/` на `/workspaces/{id}/analytics/overview/`

## Приоритет изменений

### Высокий приоритет (критические несоответствия)
1. `/notification-settings/` → `/notifications/settings/`
2. `/search-history/` → `/search/history/`
3. `/saved-searches/` → `/search/saved/`
4. `/notes/pages/` → `/pages/`
5. `/notes/tags/` → `/tags/`

### Средний приоритет (упрощение структуры)
1. `/taskboards/` → `/boards/`
2. `/workspaces/invitations/` → `/workspaces/{id}/invitations/`
3. `/workspaces/analytics/` → `/workspaces/{id}/analytics/`

### Низкий приоритет (оптимизация)
1. `/tasks/{id}/move/` → `/tasks/{id}/` (PATCH)
2. Упрощение @action методов на nested URLs

## Тестирование после изменений

1. **Бэкенд**: `pytest -q` - все тесты должны проходить
2. **Фронтенд**: `pnpm lint && pnpm typecheck` - без ошибок
3. **Интеграция**: Проверить все API вызовы работают
4. **Поиск дублей**: `rg -n "старый_путь" .` - 0 результатов
