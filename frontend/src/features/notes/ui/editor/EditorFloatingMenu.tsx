import React from 'react';
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
} from '@heroicons/react/24/outline';

interface EditorFloatingMenuProps {
  editor: Editor;
}

const EditorFloatingMenu: React.FC<EditorFloatingMenuProps> = ({ editor }) => {
  const MenuButton: React.FC<{
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }> = ({ onClick, icon: Icon, label }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors w-full text-left"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const insertHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const insertList = (type: 'bullet' | 'ordered' | 'task') => {
    if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run();
    } else if (type === 'ordered') {
      editor.chain().focus().toggleOrderedList().run();
    } else if (type === 'task') {
      editor.chain().focus().toggleTaskList().run();
    }
  };

  const insertImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const insertQuote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertDivider = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
        Insert Block
      </div>
      
      <div className="py-1">
        <MenuButton
          onClick={() => insertHeading(1)}
          icon={Bars3BottomLeftIcon}
          label="Heading 1"
        />
        <MenuButton
          onClick={() => insertHeading(2)}
          icon={Bars3BottomLeftIcon}
          label="Heading 2"
        />
        <MenuButton
          onClick={() => insertHeading(3)}
          icon={Bars3BottomLeftIcon}
          label="Heading 3"
        />
      </div>
      
      <div className="border-t border-gray-100 py-1">
        <MenuButton
          onClick={() => insertList('bullet')}
          icon={ListBulletIcon}
          label="Bullet List"
        />
        <MenuButton
          onClick={() => insertList('ordered')}
          icon={NumberedListIcon}
          label="Numbered List"
        />
        <MenuButton
          onClick={() => insertList('task')}
          icon={CheckSquareIcon}
          label="Task List"
        />
      </div>
      
      <div className="border-t border-gray-100 py-1">
        <MenuButton
          onClick={insertImage}
          icon={PhotoIcon}
          label="Image"
        />
        <MenuButton
          onClick={insertTable}
          icon={TableCellsIcon}
          label="Table"
        />
        <MenuButton
          onClick={insertCodeBlock}
          icon={CodeBracketIcon}
          label="Code Block"
        />
      </div>
      
      <div className="border-t border-gray-100 py-1">
        <MenuButton
          onClick={insertQuote}
          icon={ChatBubbleLeftRightIcon}
          label="Quote"
        />
        <MenuButton
          onClick={insertDivider}
          icon={() => <div className="w-4 h-0.5 bg-gray-400 rounded" />}
          label="Divider"
        />
      </div>
    </div>
  );
};

export default EditorFloatingMenu;
