import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useSearch } from '../shared/hooks/useSearch';
import { SearchRequest, SearchFilters } from '../features/search/api';
import SearchResultItem from '../features/search/ui/search/SearchResultItem';
import SearchFiltersPanel from '../features/search/ui/search/SearchFiltersPanel';
import LoadingSpinner from '../shared/ui/LoadingSpinner';
import EmptyState from '../shared/ui/EmptyState';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'all' | 'pages' | 'tasks' | 'databases'>(
    (searchParams.get('type') as any) || 'all'
  );
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const workspaceId = searchParams.get('workspace') || undefined;

  const searchRequest: SearchRequest = {
    query: query || undefined,
    search_type: searchType,
    workspace_id: workspaceId,
    filters,
    page_size: 20,
    sort_by: 'relevance',
    sort_order: 'desc'
  };

  const { data: searchResults, isLoading, error } = useSearch(
    searchRequest,
    query.length >= 2 || Object.keys(filters).length > 0
  );

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (searchType !== 'all') params.set('type', searchType);
    if (workspaceId) params.set('workspace', workspaceId);
    
    setSearchParams(params);
  }, [query, searchType, workspaceId, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered automatically by useSearch hook
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pages':
        return DocumentIcon;
      case 'tasks':
        return ClipboardDocumentListIcon;
      case 'databases':
        return TableCellsIcon;
      default:
        return MagnifyingGlassIcon;
    }
  };

  const searchTypeOptions = [
    { value: 'all', label: 'Всё', icon: MagnifyingGlassIcon },
    { value: 'pages', label: 'Страницы', icon: DocumentIcon },
    { value: 'tasks', label: 'Задачи', icon: ClipboardDocumentListIcon },
    { value: 'databases', label: 'Базы данных', icon: TableCellsIcon },
  ];

  const hasSearchQuery = query.length >= 2 || Object.keys(filters).length > 0;
  const hasResults = searchResults?.results && searchResults.results.length > 0;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Поиск
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Фильтры</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <SearchFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Main Search Area */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Search Input */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Поиск по страницам, задачам, базам данных..."
                />
              </div>
            </form>

            {/* Search Type Tabs */}
            <div className="flex items-center space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {searchTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSearchType(option.value as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      searchType === option.value
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Results */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700">
                  Произошла ошибка при поиске. Попробуйте ещё раз.
                </p>
              </div>
            ) : !hasSearchQuery ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Начните поиск
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Введите поисковый запрос или используйте фильтры для поиска содержимого.
                </p>
              </div>
            ) : !hasResults ? (
              <EmptyState
                icon={MagnifyingGlassIcon}
                title="Ничего не найдено"
                description={`По запросу "${query}" ничего не найдено. Попробуйте изменить поисковый запрос или фильтры.`}
              />
            ) : (
              <div className="space-y-4">
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Найдено {searchResults.total_count} результатов
                    {searchResults.search_time && (
                      <span> за {Math.round(searchResults.search_time * 1000)}мс</span>
                    )}
                  </p>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                  {searchResults.results.map((result) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      query={query}
                    />
                  ))}
                </div>

                {/* Загрузить ещё */}
                {searchResults.has_next && (
                  <div className="text-center pt-6">
                    <button className="btn-secondary">
                      Загрузить ещё
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
