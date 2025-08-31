import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import { DatabaseExtension } from '../../../../shared/extensions';

import EditorToolbar from './EditorToolbar';
import EditorBubbleMenu from './EditorBubbleMenu';
import EditorFloatingMenu from './EditorFloatingMenu';
import SlashCommands from './SlashCommands';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  showToolbar?: boolean;
  collaborative?: boolean;
  onSelectionUpdate?: (selection: any) => void;
  onTransaction?: (transaction: any) => void;
  onInsertDatabase?: () => void;
}

export interface RichTextEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  getSelection: () => any;
  insertContent: (content: string) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  className = '',
  showToolbar = true,
  collaborative = false,
  onSelectionUpdate,
  onTransaction,
  onInsertDatabase,
}, ref) => {
  const [slashCommandsOpen, setSlashCommandsOpen] = useState(false);
  const [slashCommandsPosition, setSlashCommandsPosition] = useState({ x: 0, y: 0 });
  // const [lastSlashPosition, setLastSlashPosition] = useState(0); // Убираю неиспользуемую переменную
  const [isMouseClick, setIsMouseClick] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: collaborative ? false : undefined, // Disable history for collaborative editing
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      HorizontalRule,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2 rounded-r',
        },
      }),
      DatabaseExtension.configure({
        HTMLAttributes: {
          class: 'database-block my-4',
        },
      }),
    ],
    content,
    editable,
          onUpdate: ({ editor }) => {
        if (onChange) {
          onChange(editor.getHTML());
        }
        
        // Проверяем slash-команды
        const { selection } = editor.state;
        const { from } = selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 10), from);
        
        if (textBefore.endsWith('/')) {
          const coords = editor.view.coordsAtPos(from);
          setSlashCommandsPosition({ 
            x: coords.left, 
            y: coords.bottom + 5 
          });
          setSlashCommandsOpen(true);
          // setLastSlashPosition(from); // Убираю неиспользуемый вызов
        } else if (textBefore.includes('/') && slashCommandsOpen) {
          // Если пользователь продолжает печатать после "/", обновляем поиск
          // const searchText = textBefore.substring(textBefore.lastIndexOf('/') + 1); // Убираю неиспользуемую переменную
          // Здесь можно добавить логику поиска команд
        } else if (!textBefore.includes('/') && slashCommandsOpen) {
          setSlashCommandsOpen(false);
        }
      },
      onFocus: ({ editor, event }) => {
        // Отмечаем, что это клик мыши
        if (event && event.type === 'mousedown') {
          setIsMouseClick(true);
          // Сбрасываем через небольшую задержку
          setTimeout(() => setIsMouseClick(false), 100);
        }
      },
      

    onSelectionUpdate: ({ editor, transaction }) => {
      if (onSelectionUpdate) {
        onSelectionUpdate({
          selection: editor.state.selection,
          transaction,
        });
      }
    },
    onTransaction: ({ transaction }) => {
      if (onTransaction) {
        onTransaction(transaction);
      }
    },
  });

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (content: string) => {
      editor?.commands.setContent(content);
    },
    focus: () => {
      editor?.commands.focus();
    },
    getSelection: () => editor?.state.selection,
    insertContent: (content: string) => {
      editor?.commands.insertContent(content);
    },
  }));

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {showToolbar && editable && (
        <EditorToolbar editor={editor} />
      )}
      
      <div className="relative">
        {editor && (
          <>
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="bubble-menu"
            >
              <EditorBubbleMenu editor={editor} />
            </BubbleMenu>
            
            <FloatingMenu
              editor={editor}
              tippyOptions={{ 
                duration: 100,
                delay: [500, 0], // Увеличиваю задержку до 500ms
                placement: 'top-start',
                interactive: true,
              }}
              shouldShow={({ editor, view, state, oldState }) => {
                // Показываем ТОЛЬКО при клике мыши, а не при навигации клавиатурой
                const { selection } = state;
                const { from } = selection;
                
                if (!from) return false;
                
                // Проверяем, что это пустая строка
                const lineStart = editor.state.doc.resolve(from).start();
                const lineEnd = editor.state.doc.resolve(from).end();
                const lineContent = editor.state.doc.textBetween(lineStart, lineEnd);
                
                // Показываем только если строка действительно пустая
                const isEmptyLine = lineContent.trim().length === 0;
                
                // И курсор находится в начале строки
                const isAtLineStart = from === lineStart;
                
                // Показываем только при клике мыши
                return isEmptyLine && isAtLineStart && selection.empty && !editor.isDestroyed && isMouseClick;
              }}
              className="floating-menu"
            >
              <EditorFloatingMenu editor={editor} />
            </FloatingMenu>
          </>
        )}
        
        <EditorContent
          editor={editor}
          className={`prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none
            ${editable ? 'min-h-[200px]' : ''} 
            focus:outline-none
            prose-headings:font-semibold
            prose-h1:text-3xl prose-h1:mb-4
            prose-h2:text-2xl prose-h2:mb-3
            prose-h3:text-xl prose-h3:mb-2
            prose-p:mb-2 prose-p:leading-relaxed
            prose-ul:my-2 prose-ol:my-2
            prose-li:my-1
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
            prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 
            prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-white 
            prose-pre:rounded prose-pre:p-4
            prose-img:rounded-lg prose-img:shadow-sm
            prose-table:border-collapse
            prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 
            prose-th:px-3 prose-th:py-2
            prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2
          `}
        />
      </div>
      
      {/* Slash Commands */}
                <SlashCommands
            editor={editor}
            isOpen={slashCommandsOpen}
            onClose={() => setSlashCommandsOpen(false)}
            position={slashCommandsPosition}
            onInsertDatabase={onInsertDatabase}
          />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
