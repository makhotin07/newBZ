import React from 'react';
import { Editor } from '@tiptap/react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeBracketIcon as CodeIcon,
  LinkIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';

interface EditorBubbleMenuProps {
  editor: Editor;
}

const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor }) => {
  const MenuButton: React.FC<{
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
  }> = ({ onClick, active = false, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? 'bg-gray-700 text-white'
          : 'text-gray-300 hover:bg-gray-600 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  return (
    <div className="flex items-center bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-1 space-x-1">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <BoldIcon className="w-4 h-4" />
      </MenuButton>
      
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <ItalicIcon className="w-4 h-4" />
      </MenuButton>
      
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </MenuButton>
      
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Code"
      >
        <CodeIcon className="w-4 h-4" />
      </MenuButton>
      
      <div className="w-px h-6 bg-gray-600 mx-1" />
      
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')}
        title="Highlight"
      >
        <PaintBrushIcon className="w-4 h-4" />
      </MenuButton>
      
      {editor.isActive('link') ? (
        <MenuButton
          onClick={removeLink}
          active={true}
          title="Remove Link"
        >
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
      ) : (
        <MenuButton
          onClick={addLink}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
      )}
    </div>
  );
};

export default EditorBubbleMenu;
