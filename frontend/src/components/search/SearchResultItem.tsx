import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentIcon, 
  ClipboardDocumentListIcon, 
  TableCellsIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { SearchResult } from '../../services/searchApi';

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, query }) => {
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
        return 'Page';
      case 'task':
        return 'Task';
      case 'database':
        return 'Database';
      default:
        return 'Content';
    }
  };

  const getContentTypeBadgeColor = (contentType: string) => {
    switch (contentType) {
      case 'page':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'database':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const words = searchQuery.toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  };

  const Icon = getContentTypeIcon(result.content_type);

  return (
    <Link
      to={result.url}
      className="block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-6"
    >
      <div className="flex items-start space-x-4">
        {/* Icon and Badge */}
        <div className="flex flex-col items-center space-y-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getContentTypeBadgeColor(result.content_type)}`}>
            {getContentTypeLabel(result.content_type)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 
              className="text-lg font-semibold text-gray-900 truncate"
              dangerouslySetInnerHTML={{ 
                __html: highlightText(result.title, query) 
              }}
            />
            {result.metadata?.workspace && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded ml-4">
                {result.metadata.workspace}
              </span>
            )}
          </div>

          {/* Content Preview */}
          {result.highlight?.fragment ? (
            <div 
              className="text-sm text-gray-600 mb-3 line-clamp-3"
              dangerouslySetInnerHTML={{ 
                __html: result.highlight.fragment 
              }}
            />
          ) : (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {result.content}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Updated {formatDate(result.updated_at)}</span>
            </div>

            {result.metadata?.author && (
              <div className="flex items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span>{result.metadata.author}</span>
              </div>
            )}

            {/* Content-specific metadata */}
            {result.content_type === 'task' && result.metadata && (
              <>
                {result.metadata.priority && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    result.metadata.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : result.metadata.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {result.metadata.priority} priority
                  </span>
                )}
                {result.metadata.status && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {result.metadata.status}
                  </span>
                )}
                {result.metadata.due_date && (
                  <span className="text-xs">
                    Due {formatDate(result.metadata.due_date)}
                  </span>
                )}
              </>
            )}

            {result.content_type === 'database' && result.metadata && (
              <>
                {result.metadata.fields_count && (
                  <span className="text-xs">
                    {result.metadata.fields_count} fields
                  </span>
                )}
                {result.metadata.rows_count && (
                  <span className="text-xs">
                    {result.metadata.rows_count} rows
                  </span>
                )}
              </>
            )}
          </div>

          {/* Tags */}
          {result.tags && result.tags.length > 0 && (
            <div className="mt-3 flex items-center space-x-2">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {result.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {result.tags.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{result.tags.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SearchResultItem;
