import { Node, mergeAttributes } from '@tiptap/core';

export interface DatabaseOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    database: {
      /**
       * Вставить блок базы данных
       */
      insertDatabase: (options: { databaseId: string; viewId?: string }) => ReturnType;
      /**
       * Обновить блок базы данных
       */
      updateDatabase: (options: { databaseId: string; viewId?: string }) => ReturnType;
    };
  }
}

/**
 * TipTap расширение для вставки базы данных как блока на страницу
 * Хранит database_id и view_id для отображения соответствующего представления
 */
export const DatabaseExtension = Node.create<DatabaseOptions>({
  name: 'database',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'database-block',
      },
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      databaseId: {
        default: null,
        parseHTML: element => element.getAttribute('data-database-id'),
        renderHTML: attributes => {
          if (!attributes.databaseId) {
            return {};
          }
          return {
            'data-database-id': attributes.databaseId,
          };
        },
      },
      viewId: {
        default: null,
        parseHTML: element => element.getAttribute('data-view-id'),
        renderHTML: attributes => {
          if (!attributes.viewId) {
            return {};
          }
          return {
            'data-view-id': attributes.viewId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="database"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'database' })];
  },

  addCommands() {
    return {
      insertDatabase:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      updateDatabase:
        (options) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, options);
        },
    };
  },

  addNodeView() {
    return ({ node, editor }) => {
      const dom = document.createElement('div');
      dom.classList.add('database-block-wrapper');
      dom.setAttribute('data-type', 'database');
      dom.setAttribute('data-database-id', node.attrs.databaseId || '');
      dom.setAttribute('data-view-id', node.attrs.viewId || '');

      // Создаем placeholder для базы данных
      const placeholder = document.createElement('div');
      placeholder.classList.add('database-placeholder');
      placeholder.innerHTML = `
        <div class="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div class="text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-1">База данных</h3>
            <p class="text-sm text-gray-500 mb-3">ID: ${node.attrs.databaseId || 'Не указан'}</p>
            ${node.attrs.viewId ? `<p class="text-sm text-gray-500">Представление: ${node.attrs.viewId}</p>` : ''}
            <div class="mt-4 space-x-2">
              <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" onclick="window.openDatabaseEditor('${node.attrs.databaseId}', '${node.attrs.viewId}')">
                Открыть
              </button>
              <button class="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors" onclick="window.editDatabaseBlock('${node.attrs.databaseId}', '${node.attrs.viewId}')">
                Изменить
              </button>
            </div>
          </div>
        </div>
      `;

      dom.appendChild(placeholder);

      // Добавляем глобальные функции для взаимодействия
      (window as any).openDatabaseEditor = (databaseId: string, viewId?: string) => {
        // Здесь можно открыть модальное окно или перейти к базе данных
        console.log('Открыть базу данных:', { databaseId, viewId });
      };

      (window as any).editDatabaseBlock = (databaseId: string, viewId?: string) => {
        // Здесь можно открыть модальное окно для редактирования блока
        console.log('Редактировать блок базы данных:', { databaseId, viewId });
      };

      return {
        dom,
        update: (updatedNode) => {
          // Обновляем placeholder при изменении атрибутов
          if (updatedNode.type.name === this.name) {
            const newDatabaseId = updatedNode.attrs.databaseId;
            const newViewId = updatedNode.attrs.viewId;
            
            dom.setAttribute('data-database-id', newDatabaseId || '');
            dom.setAttribute('data-view-id', newViewId || '');
            
            // Обновляем отображаемую информацию
            const idElement = placeholder.querySelector('p:first-of-type');
            if (idElement) {
              idElement.textContent = `ID: ${newDatabaseId || 'Не указан'}`;
            }
            
            const viewElement = placeholder.querySelector('p:last-of-type');
            if (viewElement && newViewId) {
              viewElement.textContent = `Представление: ${newViewId}`;
            } else if (viewElement && !newViewId) {
              viewElement.remove();
            }
          }
          return true; // Возвращаем true для успешного обновления
        },
      };
    };
  },
});
