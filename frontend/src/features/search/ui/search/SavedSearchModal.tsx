import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface SavedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, isPublic: boolean) => void;
  searchQuery: string;
  isLoading?: boolean;
}

const SavedSearchModal: React.FC<SavedSearchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  searchQuery,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(name.trim(), isPublic);
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setIsPublic(false);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <BookmarkIcon className="h-6 w-6 text-blue-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Save Search
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Query
              </label>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                {searchQuery || 'No search query'}
              </p>
            </div>

            <div>
              <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="search-name"
                type="text"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter a name for this search"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is-public"
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="is-public" className="text-sm text-gray-700">
                Make this search public (visible to other workspace members)
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading && <LoadingSpinner size="sm" />}
                <span>{isLoading ? 'Saving...' : 'Save Search'}</span>
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SavedSearchModal;
