import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ClockIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
  TableCellsIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useQuickSearch, useAutocomplete } from '../../../../shared/hooks/useSearch';
import { useDebounce } from '../../../../shared/hooks/useDebounce';

import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface GlobalSearchProps {
  workspaceId?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ workspaceId }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  
  // Quick search for results
  const { 
    data: quickResults, 
    isLoading: isSearchLoading 
  } = useQuickSearch(debouncedQuery, workspaceId);
  
  // Autocomplete for suggestions
  const { 
    data: autocomplete, 
    isLoading: isAutocompleteLoading 
  } = useAutocomplete(debouncedQuery, workspaceId);

  const getTotalItems = useCallback(() => {
    let count = 0;
    if (showAutocomplete && autocomplete) {
      count += autocomplete.length;
    }
    if (quickResults) {
      count += quickResults.pages.length + quickResults.tasks.length + quickResults.databases.length;
    }
    return count;
  }, [showAutocomplete, autocomplete, quickResults]);

  const handleEnterKey = useCallback(() => {
    if (selectedIndex >= 0) {
      // Handle selection based on index
      // This would navigate to the selected item
    } else if (query.trim()) {
      // Navigate to full search page
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}&workspace=${workspaceId || ''}`;
    }
  }, [selectedIndex, query, workspaceId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          inputRef.current?.blur();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const totalItems = getTotalItems();
            return prev < totalItems - 1 ? prev + 1 : 0;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const totalItems = getTotalItems();
            return prev > 0 ? prev - 1 : totalItems - 1;
          });
          break;
        case 'Enter':
          e.preventDefault();
          handleEnterKey();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, quickResults, autocomplete, getTotalItems, handleEnterKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setShowAutocomplete(value.length >= 2 && value.length < 10);
    setSelectedIndex(-1);
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'page':
        return DocumentIcon;
      case 'task':
        return ClipboardDocumentListIcon;
      case 'database':
        return TableCellsIcon;
      default:
        return DocumentIcon;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'page':
        return 'Страница';
      case 'task':
        return 'Задача';
      case 'database':
        return 'База данных';
      default:
        return 'Контент';
    }
  };

  const renderQuickResults = () => {
    if (!quickResults || (!quickResults.pages.length && !quickResults.tasks.length && !quickResults.databases.length)) {
      return (
        <div className="px-4 py-6 text-center text-gray-500">
          <MagnifyingGlassIcon className="mx-auto h-6 w-6 mb-2" />
          <p>No results found</p>
          {query.trim() && (
            <Link
              to={`/search?q=${encodeURIComponent(query.trim())}&workspace=${workspaceId || ''}`}
              className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block"
              onClick={() => setIsOpen(false)}
            >
              Search everywhere →
            </Link>
          )}
        </div>
      );
    }

    const allResults = [
      ...quickResults.pages,
      ...quickResults.tasks,
      ...quickResults.databases
    ];

    return (
      <div className="max-h-96 overflow-y-auto">
        {allResults.map((result, index) => {
          const Icon = getContentTypeIcon(result.content_type);
          return (
            <Link
              key={result.id}
              to={result.url}
              className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-start space-x-3">
                <Icon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {getContentTypeLabel(result.content_type)}
                    </span>
                  </div>
                  {result.content && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {result.highlight?.fragment || result.content}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                    {result.metadata?.workspace && (
                      <span>{result.metadata.workspace}</span>
                    )}
                    {result.tags && result.tags.length > 0 && (
                      <span>
                        #{result.tags.slice(0, 2).join(', #')}
                        {result.tags.length > 2 && '...'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        
        {query.trim() && (
          <Link
            to={`/search?q=${encodeURIComponent(query.trim())}&workspace=${workspaceId || ''}`}
            className="block px-4 py-3 text-center text-blue-600 hover:bg-blue-50 border-t border-gray-200 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Show all results for "{query}" →
          </Link>
        )}
      </div>
    );
  };

  const renderAutocomplete = () => {
    if (!showAutocomplete || !autocomplete?.length) return null;

    return (
      <div className="border-b border-gray-200">
        <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
          Suggestions
        </div>
        {autocomplete.slice(0, 5).map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.value}`}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 ${
              index === selectedIndex ? 'bg-blue-50' : ''
            }`}
            onClick={() => {
              setQuery(suggestion.value);
              inputRef.current?.focus();
              setShowAutocomplete(false);
            }}
          >
            {suggestion.type === 'history' && (
              <ClockIcon className="h-4 w-4 text-gray-400" />
            )}
            {suggestion.type === 'tag' && (
              <span className="text-blue-500 font-medium">#</span>
            )}
            {suggestion.type === 'page' && (
              <DocumentIcon className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">{suggestion.label}</span>
            {suggestion.count && (
              <span className="text-xs text-gray-400">({suggestion.count})</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative max-w-md w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Поиск по страницам, задачам, базам данных..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setShowAutocomplete(false);
              inputRef.current?.focus();
            }}
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-2xl">
          {/* Loading state */}
          {(isSearchLoading || isAutocompleteLoading) && (
            <div className="px-4 py-8 text-center">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {/* Autocomplete suggestions */}
          {!isSearchLoading && !isAutocompleteLoading && renderAutocomplete()}

          {/* Quick results */}
          {!isSearchLoading && !isAutocompleteLoading && !showAutocomplete && renderQuickResults()}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
