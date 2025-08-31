import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ShareIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

import { RichTextEditor } from '../editor';
import type { RichTextEditorRef } from '../editor/RichTextEditor';

import PageVersions from './PageVersions';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';
import EmojiPicker from '../../../../shared/ui/EmojiPicker';
import TagSelector from '../../../../shared/ui/TagSelector';
import { usePage, useUpdatePage, useArchivePage, useDuplicatePage, useDeletePage } from '../../../../shared/hooks/useNotes';
import toast from 'react-hot-toast';

const PageEditor: React.FC = () => {
  const { workspaceId, pageId } = useParams<{ workspaceId: string; pageId: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showVersions, setShowVersions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const editorRef = useRef<RichTextEditorRef>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const { data: page, isLoading, error } = usePage(pageId!);
  const updatePageMutation = useUpdatePage(pageId!);
  const archivePageMutation = useArchivePage();
  const duplicatePageMutation = useDuplicatePage();
  const deletePageMutation = useDeletePage();
  
  // Auto-save functionality
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setIcon(page.icon || '');
    }
  }, [page]);
  
  const scheduleAutoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  };
  
  const handleContentChange = (content: string) => {
    setIsEditing(true);
    scheduleAutoSave();
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsEditing(true);
    scheduleAutoSave();
  };
  
  const handleIconSelect = (emoji: string) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
    setIsEditing(true);
    scheduleAutoSave();
  };
  
  const handleSave = async () => {
    if (!page || !isEditing) return;
    
    try {
      const content = editorRef.current?.getContent() || '';
      
      await updatePageMutation.mutateAsync({
        title: title || 'Untitled',
        content,
        icon: icon || undefined,
      });
      
      setIsEditing(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };
  
  const handleArchive = () => {
    archivePageMutation.mutate(pageId!);
  };
  
  const handleDuplicate = () => {
    duplicatePageMutation.mutate(pageId!);
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      deletePageMutation.mutate(pageId!, {
        onSuccess: () => {
          navigate(`/workspace/${workspaceId}`);
        }
      });
    }
  };
  
  const handleShare = () => {
    // TODO: Implement share functionality
    toast.success('Share functionality coming soon!');
  };
  
  // Save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate(`/workspace/${workspaceId}`)}
            className="btn-primary"
          >
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500">
              <span>{page.workspace_name}</span>
              {page.path && <span> / {page.path}</span>}
            </nav>
            
            {/* Save status */}
            {isEditing ? (
              <span className="text-sm text-yellow-600 flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                Saving...
              </span>
            ) : lastSaved ? (
              <span className="text-sm text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          
          <div className="flex items-center space-x-2">

            
            {/* Versions Toggle */}
            <button
              onClick={() => setShowVersions(!showVersions)}
              className={`p-2 rounded-md transition-colors ${
                showVersions ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Version History"
            >
              <ClockIcon className="w-5 h-5" />
            </button>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Share"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            
            {/* More Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </Menu.Button>
              
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none z-20">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleDuplicate}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                          Duplicate
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleArchive}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                          {page.is_archived ? 'Unarchive' : 'Archive'}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleDelete}
                          className={`${
                            active ? 'bg-red-50' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 ${showVersions ? 'pr-4' : ''}`}>
          <div className="p-6">
            {/* Page Icon & Title */}
            <div className="mb-6">
              <div className="flex items-start space-x-3">
                {/* Icon Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-4xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                    title="Change icon"
                  >
                    {icon || '📄'}
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-20">
                      <EmojiPicker
                        onEmojiSelect={handleIconSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    </div>
                  )}
                </div>
                
                {/* Title Input */}
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Untitled"
                  className="flex-1 text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-400 resize-none overflow-hidden"
                  style={{ height: 'auto', minHeight: '1.2em' }}
                />
              </div>
              
              {/* Tags */}
              <div className="mt-4">
                <TagSelector
                  selectedTags={page.tags}
                  onChange={(tagIds) => {
                    updatePageMutation.mutate({ tag_ids: tagIds });
                  }}
                />
              </div>
            </div>
            
            {/* Rich Text Editor */}
            <div className="mb-8">
              <RichTextEditor
                ref={editorRef}
                content={page.content || ''}
                onChange={handleContentChange}
                placeholder="Start writing..."
                className="min-h-[400px]"
                collaborative={true}
              />
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        {showVersions && (
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            <PageVersions 
              pageId={pageId!} 
              onClose={() => setShowVersions(false)}
              onRestore={(version) => {
                // TODO: Implement version restoration
                toast.success('Version restored!');
                setShowVersions(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageEditor;
