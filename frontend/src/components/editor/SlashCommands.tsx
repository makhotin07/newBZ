import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bars3BottomLeftIcon,
  ListBulletIcon,
  NumberedListIcon,
  CheckIcon as CheckSquareIcon,
  PhotoIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  TableCellsIcon,
  MinusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface SlashCommandsProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: () => void;
  keywords: string[];
}

const SlashCommands: React.FC<SlashCommandsProps> = ({
  editor,
  isOpen,
  onClose,
  position
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<CommandItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'heading1',
      title: 'Заголовок 1',
      description: 'Большой заголовок',
      icon: Bars3BottomLeftIcon,
      command: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        onClose();
      },
      keywords: ['заголовок', 'h1', 'большой', 'title', 'heading']
    },
    {
      id: 'heading2',
      title: 'Заголовок 2',
      description: 'Средний заголовок',
      icon: Bars3BottomLeftIcon,
      command: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        onClose();
      },
      keywords: ['заголовок', 'h2', 'средний', 'subtitle']
    },
    {
      id: 'heading3',
      title: 'Заголовок 3',
      description: 'Маленький заголовок',
      icon: Bars3BottomLeftIcon,
      command: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        onClose();
      },
      keywords: ['заголовок', 'h3', 'маленький', 'subsubtitle']
    },
    {
      id: 'bulletList',
      title: 'Маркированный список',
      description: 'Список с точками',
      icon: ListBulletIcon,
      command: () => {
        editor.chain().focus().toggleBulletList().run();
        onClose();
      },
      keywords: ['список', 'точки', 'bullet', 'маркированный', 'ul']
    },
    {
      id: 'numberedList',
      title: 'Нумерованный список',
      description: 'Список с цифрами',
      icon: NumberedListIcon,
      command: () => {
        editor.chain().focus().toggleOrderedList().run();
        onClose();
      },
      keywords: ['список', 'цифры', 'numbered', 'нумерованный', 'ol']
    },
    {
      id: 'taskList',
      title: 'Чек-лист',
      description: 'Список с галочками',
      icon: CheckSquareIcon,
      command: () => {
        editor.chain().focus().toggleTaskList().run();
        onClose();
      },
      keywords: ['чек', 'галочки', 'todo', 'задачи', 'task']
    },
    {
      id: 'quote',
      title: 'Цитата',
      description: 'Выделенная цитата',
      icon: ChatBubbleLeftRightIcon,
      command: () => {
        editor.chain().focus().toggleBlockquote().run();
        onClose();
      },
      keywords: ['цитата', 'quote', 'выделить', 'курсив', 'blockquote']
    },
    {
      id: 'codeBlock',
      title: 'Блок кода',
      description: 'Код с подсветкой',
      icon: CodeBracketIcon,
      command: () => {
        editor.chain().focus().toggleCodeBlock().run();
        onClose();
      },
      keywords: ['код', 'code', 'программирование', 'синтаксис', 'codeblock']
    },
    {
      id: 'table',
      title: 'Таблица',
      description: 'Таблица с данными',
      icon: TableCellsIcon,
      command: () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        onClose();
      },
      keywords: ['таблица', 'table', 'данные', 'grid', 'cells']
    },
    {
      id: 'image',
      title: 'Изображение',
      description: 'Вставить изображение',
      icon: PhotoIcon,
      command: () => {
        const url = window.prompt('Введите URL изображения:');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
        onClose();
      },
      keywords: ['изображение', 'image', 'картинка', 'фото', 'img']
    },
    {
      id: 'divider',
      title: 'Разделитель',
      description: 'Горизонтальная линия',
      icon: MinusIcon,
      command: () => {
        editor.chain().focus().setHorizontalRule().run();
        onClose();
      },
      keywords: ['разделитель', 'divider', 'линия', 'hr', 'horizontal']
    },
    {
      id: 'paragraph',
      title: 'Обычный текст',
      description: 'Параграф',
      icon: DocumentTextIcon,
      command: () => {
        editor.chain().focus().setParagraph().run();
        onClose();
      },
      keywords: ['текст', 'параграф', 'paragraph', 'обычный', 'p']
    }
  ];

  useEffect(() => {
    if (searchQuery) {
      const filtered = commands.filter(command =>
        command.keywords.some(keyword =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ) || command.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommands(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredCommands(commands);
      setSelectedIndex(0);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].command();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Закрываем при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="p-2">
        <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
          Начните печатать для поиска команд
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((command, index) => {
            const Icon = command.icon;
            return (
              <div
                key={command.id}
                className={`flex items-center px-3 py-2 cursor-pointer rounded-md transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => command.command()}
              >
                <div className="w-8 h-8 flex items-center justify-center text-lg mr-3">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{command.title}</div>
                  <div className="text-xs text-gray-500">{command.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCommands.length === 0 && (
          <div className="px-3 py-4 text-center text-gray-500 text-sm">
            Команды не найдены
          </div>
        )}
      </div>
    </div>
  );
};

export default SlashCommands;
