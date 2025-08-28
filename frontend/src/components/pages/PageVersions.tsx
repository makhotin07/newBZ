import React, { useState } from 'react';
import {
  XMarkIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { usePageVersions } from '../../hooks/useNotes';
import { PageVersion } from '../../services/notesApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmModal from '../ui/ConfirmModal';

interface PageVersionsProps {
  pageId: string;
  onClose: () => void;
  onRestore: (version: PageVersion) => void;
}

const PageVersions: React.FC<PageVersionsProps> = ({ pageId, onClose, onRestore }) => {
  const { user } = useAuth();
  const { data: versions, isLoading } = usePageVersions(pageId);
  const [confirm, setConfirm] = useState<{ open: boolean; version?: PageVersion }>({ open: false });
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleRestore = (version: PageVersion) => {
    setConfirm({ open: true, version });
  };

  const VersionItem: React.FC<{ version: PageVersion; isLatest: boolean }> = ({ 
    version, 
    isLatest 
  }) => {
    const isCurrentUser = user?.id === version.created_by;
    const isPreviewOpen = previewId === version.id;
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                v{version.version_number}
              </span>
              {isLatest && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Текущая
                </span>
              )}
            </div>
            
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {typeof version.title === 'string' ? version.title : 'Без названия'}
            </h4>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span>Автор: {version.created_by_name}</span>
                {isCurrentUser && (
                  <span className="text-blue-600">(вы)</span>
                )}
              </div>
              <span>•</span>
              <span>{new Date(version.created_at).toLocaleString()}</span>
            </div>
            
            {/* Content Preview */}
            <div className="mt-3 p-3 bg-gray-50 rounded border">
              <div className="text-xs text-gray-600 mb-2">Предпросмотр содержимого:</div>
              <div className="text-sm text-gray-700 line-clamp-3">
                {typeof version.content_text === 'string' && version.content_text.length > 0
                  ? (version.content_text.substring(0, 200) + (version.content_text.length > 200 ? '...' : ''))
                  : (<em>Нет содержимого</em>)}
              </div>
            </div>

            {isPreviewOpen && (
              <div className="mt-3 p-4 bg-white rounded border">
                <div className="text-xs text-gray-500 mb-2">Полный текст версии:</div>
                <div className="whitespace-pre-wrap text-sm text-gray-800">
                  {typeof version.content_text === 'string' && version.content_text.length > 0
                    ? version.content_text
                    : 'Нет содержимого'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-2 mt-4">
          <button
            onClick={() => setPreviewId(prev => prev === version.id ? null : version.id)}
            className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600"
          >
            <EyeIcon className="w-4 h-4" />
            <span>{isPreviewOpen ? 'Скрыть' : 'Предпросмотр'}</span>
          </button>
          
          {!isLatest && (
            <button
              onClick={() => handleRestore(version)}
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              <span>Восстановить</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">История версий</h3>
          {versions && (
            <span className="text-sm text-gray-500">
              ({versions.length})
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : versions && versions.length > 0 ? (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <VersionItem 
                key={version.id} 
                version={version} 
                isLatest={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Нет истории версий</p>
            <p className="text-sm text-gray-400">Версии появятся по мере изменений</p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Версии создаются автоматически при изменениях</p>
          <p>• Можно восстановить любую предыдущую версию</p>
          <p>• Восстановление создаёт новую версию из выбранной</p>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirm.open}
        title="Восстановить версию?"
        message={confirm.version ? `Версия v${confirm.version.version_number}. Будет создана новая версия.` : ''}
        confirmText="Восстановить"
        cancelText="Отмена"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => {
          if (confirm.version) onRestore(confirm.version);
          setConfirm({ open: false });
        }}
      />
    </div>
  );
};

export default PageVersions;
