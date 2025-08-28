import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
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

import EditorToolbar from './EditorToolbar';
import EditorBubbleMenu from './EditorBubbleMenu';
import EditorFloatingMenu from './EditorFloatingMenu';

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
}, ref) => {
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
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
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
              tippyOptions={{ duration: 100 }}
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
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
