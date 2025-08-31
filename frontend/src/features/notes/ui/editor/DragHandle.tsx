import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DragHandleProps {
  blockId: string;
  className?: string;
}

/**
 * Компонент ручки перетаскивания для блоков
 * Отображается слева от блока и позволяет перетаскивать его
 */
export const DragHandle: React.FC<DragHandleProps> = ({ 
  blockId, 
  className = '' 
}) => {
  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/block-id', blockId);
    event.dataTransfer.setData('text/plain', blockId);
    event.dataTransfer.effectAllowed = 'move';
    
    // Добавляем визуальный индикатор
    const target = event.currentTarget.closest('[data-block-id]');
    if (target) {
      target.classList.add('opacity-50');
    }
  };

  const handleDragEnd = (event: React.DragEvent) => {
    // Убираем визуальный индикатор
    const target = event.currentTarget.closest('[data-block-id]');
    if (target) {
      target.classList.remove('opacity-50');
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`drag-handle cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors ${className}`}
      title="Перетащить блок"
    >
      <Bars3Icon className="w-4 h-4" />
    </div>
  );
};

export default DragHandle;
