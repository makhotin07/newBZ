import React, { useState } from 'react';
import { DragHandle } from './DragHandle';

interface BlockWrapperProps {
  blockId: string;
  children: React.ReactNode;
  className?: string;
  onDrop?: (blockId: string, targetId: string, position: 'before' | 'after') => void;
}

/**
 * Компонент-обертка для блоков с поддержкой drag & drop
 * Отображает ручку перетаскивания и обрабатывает drop события
 */
export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  blockId,
  children,
  className = '',
  onDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | null>(null);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    
    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    
    setIsDragOver(true);
    setDragPosition(position);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragPosition(null);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    const droppedBlockId = event.dataTransfer.getData('application/block-id');
    
    if (droppedBlockId && droppedBlockId !== blockId && onDrop) {
      const position = dragPosition || 'after';
      onDrop(droppedBlockId, blockId, position);
    }
    
    setIsDragOver(false);
    setDragPosition(null);
  };

  const getDropZoneStyles = () => {
    if (!isDragOver) return {};
    
    const baseStyles = {
      border: '2px dashed #3b82f6',
      backgroundColor: '#eff6ff',
      borderRadius: '8px',
      margin: '4px 0',
    };
    
    if (dragPosition === 'before') {
      return { ...baseStyles, marginBottom: '8px' };
    } else {
      return { ...baseStyles, marginTop: '8px' };
    }
  };

  return (
    <div
      data-block-id={blockId}
      className={`block-wrapper relative group ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop zone indicator */}
      {isDragOver && (
        <div
          className="drop-zone-indicator"
          style={getDropZoneStyles()}
        >
          <div className="text-center py-2 text-blue-600 text-sm font-medium">
            {dragPosition === 'before' ? 'Вставить перед' : 'Вставить после'}
          </div>
        </div>
      )}
      
      {/* Drag handle */}
      <div className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <DragHandle blockId={blockId} />
      </div>
      
      {/* Block content */}
      <div className="pl-8">
        {children}
      </div>
      
      {/* Hover indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 rounded-lg transition-colors pointer-events-none" />
    </div>
  );
};

export default BlockWrapper;
