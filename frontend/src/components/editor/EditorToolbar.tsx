import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeBracketIcon as CodeIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  CheckIcon as CheckSquareIcon,
  PhotoIcon,
  TableCellsIcon,
  PaintBrushIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
} from '@heroicons/react/24/outline';

interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F59E0B', 
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }> = ({ onClick, active = false, disabled = false, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 bg-white z-10">
      {/* Text Formatting */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <CodeIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2 mr-2">
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? 1 :
            editor.isActive('heading', { level: 2 }) ? 2 :
            editor.isActive('heading', { level: 3 }) ? 3 : 0
          }
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value={0}>Paragraph</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
        </select>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <Bars3BottomLeftIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <Bars3Icon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <Bars3BottomRightIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <ListBulletIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <NumberedListIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          title="Task List"
        >
          <CheckSquareIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Media & Links */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2 mr-2">
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkDialog(!showLinkDialog)}
            active={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          
          {showLinkDialog && (
            <div className="absolute top-full mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[300px]">
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addLink();
                    } else if (e.key === 'Escape') {
                      setShowLinkDialog(false);
                    }
                  }}
                />
                <button
                  onClick={addLink}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add
                </button>
                {editor.isActive('link') && (
                  <button
                    onClick={removeLink}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <ToolbarButton
          onClick={addImage}
          title="Add Image"
        >
          <PhotoIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={insertTable}
          title="Insert Table"
        >
          <TableCellsIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Text Color */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Text Color"
        >
          <PaintBrushIcon className="w-4 h-4" />
        </ToolbarButton>
        
        {showColorPicker && (
          <div className="absolute top-full mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="grid grid-cols-3 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* More Options */}
      <div className="flex items-center space-x-1 border-l border-gray-200 pl-2 ml-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          "
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          {'</>'}
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ―
        </ToolbarButton>
      </div>
    </div>
  );
};

export default EditorToolbar;
