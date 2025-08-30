import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon,
  UserIcon,
  TagIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { SearchFilters } from '../../api';

interface SearchFiltersPanelProps {
  isOpen: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
  workspaceId?: string;
}

const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  isOpen,
  filters,
  onFiltersChange,
  onClose,
  workspaceId
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterChange = (key: keyof SearchFilters, value: string, checked: boolean) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    handleFilterChange(key, newArray.length > 0 ? newArray : null);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Фильтры
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Очистить
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Date Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.created_after || ''}
                onChange={(e) => handleFilterChange('created_after', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.created_before || ''}
                onChange={(e) => handleFilterChange('created_before', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <TagIcon className="h-4 w-4 mr-2" />
            Tags
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter tag names (comma separated)"
            value={(localFilters.tags || []).join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
              handleFilterChange('tags', tags.length > 0 ? tags : null);
            }}
          />
        </div>

        {/* Task-specific filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Task Status
          </label>
          <div className="space-y-2">
            {['To Do', 'In Progress', 'Done', 'Blocked'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={(localFilters.status || []).includes(status)}
                  onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Task Priority
          </label>
          <div className="space-y-2">
            {['low', 'medium', 'high'].map((priority) => (
              <label key={priority} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={(localFilters.priority || []).includes(priority)}
                  onChange={(e) => handleArrayFilterChange('priority', priority, e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{priority}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Task Due Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Task Due Date
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">After</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.due_date_after || ''}
                onChange={(e) => handleFilterChange('due_date_after', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Before</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.due_date_before || ''}
                onChange={(e) => handleFilterChange('due_date_before', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={localFilters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="project">Project</option>
            <option value="meeting">Meeting</option>
            <option value="idea">Idea</option>
          </select>
        </div>

        {/* Author Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <UserIcon className="h-4 w-4 mr-2" />
            Author
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Author email or name"
            value={localFilters.author || ''}
            onChange={(e) => handleFilterChange('author', e.target.value)}
          />
        </div>
      </div>

      {/* Active filters count */}
      {Object.keys(localFilters).length > 0 && (
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {Object.keys(localFilters).length} filter{Object.keys(localFilters).length !== 1 ? 's' : ''} active
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchFiltersPanel;
