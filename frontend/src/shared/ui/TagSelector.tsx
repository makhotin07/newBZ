import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTags, useCreateTag } from '../../shared/hooks/useNotes';
import { Tag } from '../../shared/types';

interface TagSelectorProps {
  selectedTags: Tag[];
  onChange: (tagIds: string[]) => void;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allTags = [] } = useTags();
  const createTagMutation = useCreateTag();

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937',
  ];

  const selectedTagIds = selectedTags.map(tag => String(tag.id));

  const filteredTags = allTags.filter((tag: any) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTagIds.includes(String(tag.id))
  );

  const handleToggleTag = (tag: Tag) => {
    const tagIdStr = String(tag.id);
    const isSelected = selectedTagIds.includes(tagIdStr);
    if (isSelected) {
      onChange(selectedTagIds.filter(id => id !== tagIdStr));
    } else {
      onChange([...selectedTagIds, tagIdStr]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor,
      });

      onChange([...selectedTagIds, (newTag as any).id]);
      setNewTagName('');
      setNewTagColor('#6B7280');
      setShowCreateForm(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: tag.color + '20',
              color: tag.color,
            }}
          >
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(String(tag.id))}
              className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Add Tag Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="inline-flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        <span>Add tag</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or create tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredTags.length > 0 && (
              <div className="p-2">
                {filteredTags.map((tag: any) => (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-left">{tag.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Create New Tag */}
            {searchQuery && filteredTags.length === 0 && !showCreateForm && (
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setNewTagName(searchQuery);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create &quot;{searchQuery}&quot;</span>
                </button>
              </div>
            )}

            {/* Create Tag Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateTag} className="p-3 border-t border-gray-100">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />

                  <div className="flex flex-wrap gap-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-6 h-6 rounded border-2 transition-all ${
                          newTagColor === color
                            ? 'border-gray-400 scale-110'
                            : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTagName('');
                        setNewTagColor('#6B7280');
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTagName.trim() || createTagMutation.isPending}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            )}

            {filteredTags.length === 0 && !showCreateForm && !searchQuery && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No tags available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
