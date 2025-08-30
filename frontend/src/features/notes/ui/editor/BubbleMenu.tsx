import React from 'react';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  StrikethroughIcon,
  CommandLineIcon,
  LinkIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

interface BubbleMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onFormat: (format: string) => void;
  position: { x: number; y: number };
  selectedText: string;
}

const BubbleMenu: React.FC<BubbleMenuProps> = ({
  isOpen,
  onClose,
  onFormat,
  position,
  selectedText
}) => {
  if (!isOpen) return null;

  const formatOptions = [
    { id: 'bold', icon: BoldIcon, label: 'Жирный', shortcut: 'Ctrl+B' },
    { id: 'italic', icon: ItalicIcon, label: 'Курсив', shortcut: 'Ctrl+I' },
    { id: 'underline', icon: UnderlineIcon, label: 'Подчеркнутый', shortcut: 'Ctrl+U' },
    { id: 'strikethrough', icon: StrikethroughIcon, label: 'Зачеркнутый', shortcut: 'Ctrl+Shift+X' },
    { id: 'code', icon: CommandLineIcon, label: 'Код', shortcut: 'Ctrl+`' },
    { id: 'link', icon: LinkIcon, label: 'Ссылка', shortcut: 'Ctrl+K' },
    { id: 'highlight', icon: SwatchIcon, label: 'Выделить', shortcut: 'Ctrl+Shift+H' },
  ];

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        left: position.x,
        top: position.y - 60,
      }}
    >
      <div className="flex items-center p-1">
        {formatOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onFormat(option.id)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors group relative"
              title={`${option.label} (${option.shortcut})`}
            >
              <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {option.label}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BubbleMenu;
