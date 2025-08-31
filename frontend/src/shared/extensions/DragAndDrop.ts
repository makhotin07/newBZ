import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet } from '@tiptap/pm/view';

export interface DragAndDropOptions {
  onBlockMove?: (fromIndex: number, toIndex: number) => void;
  onBlockDrop?: (blockId: string, targetId: string, position: 'before' | 'after') => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dragAndDrop: {
      moveBlock: (fromIndex: number, toIndex: number) => ReturnType;
      dropBlock: (blockId: string, targetId: string, position: 'before' | 'after') => ReturnType;
    };
  }
}

/**
 * Расширение TipTap для drag & drop блоков
 * Поддерживает перемещение блоков внутри документа
 */
export const DragAndDrop = Extension.create<DragAndDropOptions>({
  name: 'dragAndDrop',

  addOptions() {
    return {
      onBlockMove: () => {},
      onBlockDrop: () => {},
    };
  },

  addCommands() {
    return {
      moveBlock: (fromIndex: number, toIndex: number) => ({ dispatch, state }) => {
        if (dispatch) {
          const tr = state.tr;
          const blocks = state.doc.content.content;
          
          if (fromIndex >= 0 && fromIndex < blocks.length && 
              toIndex >= 0 && toIndex < blocks.length) {
            
            // Получаем блок для перемещения
            const block = blocks[fromIndex];
            
            // Удаляем блок с исходной позиции
            tr.delete(fromIndex, fromIndex + 1);
            
            // Вставляем блок в новую позицию
            tr.insert(toIndex, block);
            
            dispatch(tr);
            
            // Вызываем callback
            if (this.options.onBlockMove) {
              this.options.onBlockMove(fromIndex, toIndex);
            }
            
            return true;
          }
        }
        return false;
      },

      dropBlock: (blockId: string, targetId: string, position: 'before' | 'after') => ({ dispatch, state }) => {
        if (dispatch) {
          // Вызываем callback для обработки drop
          if (this.options.onBlockDrop) {
            this.options.onBlockDrop(blockId, targetId, position);
          }
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('dragAndDrop'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState) {
            // Обновляем состояние при изменениях
            return DecorationSet.empty;
          },
        },
        props: {
          handleDOMEvents: {
            dragstart: (view, event) => {
              const target = event.target as HTMLElement;
              const blockElement = target.closest('[data-block-id]');
              
              if (blockElement) {
                const blockId = blockElement.getAttribute('data-block-id');
                if (blockId) {
                  if (event.dataTransfer) {
                    event.dataTransfer.setData('text/plain', blockId);
                    event.dataTransfer.setData('application/block-id', blockId);
                    event.dataTransfer.effectAllowed = 'move';
                  }
                  
                  // Добавляем визуальный индикатор
                  blockElement.classList.add('opacity-50');
                  
                  return true;
                }
              }
              return false;
            },

            dragover: (view, event) => {
              event.preventDefault();
              event.dataTransfer!.dropEffect = 'move';
              
              const target = event.target as HTMLElement;
              const blockElement = target.closest('[data-block-id]');
              
              if (blockElement) {
                // Показываем индикатор drop zone
                blockElement.classList.add('border-2', 'border-blue-300', 'bg-blue-50');
              }
              
              return true;
            },

            dragleave: (view, event) => {
              const target = event.target as HTMLElement;
              const blockElement = target.closest('[data-block-id]');
              
              if (blockElement) {
                // Убираем индикатор drop zone
                blockElement.classList.remove('border-2', 'border-blue-300', 'bg-blue-50');
              }
              
              return true;
            },

            drop: (view, event) => {
              event.preventDefault();
              
              const blockId = event.dataTransfer?.getData('application/block-id');
              const target = event.target as HTMLElement;
              const targetBlock = target.closest('[data-block-id]');
              
              if (blockId && targetBlock) {
                const targetId = targetBlock.getAttribute('data-block-id');
                
                if (targetId && targetId !== blockId) {
                  // Определяем позицию drop (before/after)
                  const rect = targetBlock.getBoundingClientRect();
                  const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
                  
                  // Вызываем команду drop
                  view.dispatch(view.state.tr.setMeta('dragAndDrop', {
                    type: 'drop',
                    blockId,
                    targetId,
                    position,
                  }));
                  
                  // Убираем индикаторы
                  targetBlock.classList.remove('border-2', 'border-blue-300', 'bg-blue-50');
                  
                  return true;
                }
              }
              
              return false;
            },

            dragend: (view, event) => {
              // Убираем визуальные индикаторы
              const blocks = view.dom.querySelectorAll('[data-block-id]');
              blocks.forEach(block => {
                block.classList.remove('opacity-50', 'border-2', 'border-blue-300', 'bg-blue-50');
              });
              
              return true;
            },
          },
        },
      }),
    ];
  },
});

export default DragAndDrop;
