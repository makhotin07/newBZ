import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DocumentIcon, 
  ShareIcon,
  EllipsisHorizontalIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { usePage, useUpdatePage } from '../shared/hooks/useNotes';
import LoadingSpinner from '../shared/ui/LoadingSpinner';
import SharePageModal from '../features/notes/ui/pages/SharePageModal';

import RichTextEditor from '../features/notes/ui/editor/RichTextEditor';
import AutoSaveIndicator from '../features/notes/ui/editor/AutoSaveIndicator';
import toast from 'react-hot-toast';
import { useSidePanel } from '../shared/hooks/useSidePanel';

const PageEditor: React.FC = () => {
  const { pageId, workspaceId } = useParams<{ pageId: string; workspaceId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const [lastSavedTitle, setLastSavedTitle] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const { data: page, isLoading, error } = usePage(pageId || '');
  const updatePageMutation = useUpdatePage(pageId || '');
  
  // Side-panel управление
  const { isOpen, type, data, openPanel, closePanel } = useSidePanel();

  useEffect(() => {
    if (page) {
      const pageTitle = typeof page.title === 'string' ? page.title : '';
      const pageContent = typeof page.content === 'string' ? page.content : '';
      
      setTitle(pageTitle);
      setContent(pageContent);
      
      // Инициализируем последнее сохраненное состояние
      setLastSavedContent(pageContent);
      setLastSavedTitle(pageTitle);
    }
  }, [page]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [autoSaveTimeout, typingTimeout]);

  const handleTyping = () => {
    setIsTyping(true);
    
    // Очищаем предыдущий таймер печати
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Устанавливаем новый таймер - считаем, что пользователь закончил печатать через 1.5 секунды
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
    
    setTypingTimeout(timeout);
  };

  const scheduleAutoSave = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // НЕ сохраняем, если пользователь активно печатает
    if (isTyping) {
      return;
    }
    
    // Проверяем, что контент действительно изменился с момента последнего сохранения
    if (content === lastSavedContent && title === lastSavedTitle) {
      return; // Не сохраняем, если ничего не изменилось
    }
    
    // Дополнительная проверка - не сохраняем пустой контент, если он был удален
    if (content.trim() === '' && lastSavedContent.trim() !== '') {
      // Если пользователь удалил весь контент, даем ему время подумать
      const timeout = setTimeout(() => {
        // Проверяем еще раз - может быть пользователь передумал
        if (content.trim() === '') {
          scheduleAutoSave(); // Повторяем попытку
        }
      }, 5000); // Даем 5 секунд на размышление
      
      setAutoSaveTimeout(timeout);
      return;
    }
    
    setSaveStatus('saving');
    const timeout = setTimeout(async () => {
      try {
        // Сохраняем текущее состояние, а не восстанавливаем старое
        const currentContent = content;
        const currentTitle = title.trim() || 'Без названия';
        
        await updatePageMutation.mutateAsync({
          title: currentTitle,
          content: currentContent,
        });
        
        setSaveStatus('saved');
        setLastSaved(new Date());
        setLastSavedContent(currentContent);
        setLastSavedTitle(currentTitle);
        
        // Сбрасываем статус через 3 секунды
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error: any) {
        setSaveStatus('error');
        toast.error('Ошибка автосохранения');
      }
    }, 3000); // Увеличиваю задержку до 3 секунд для завершения печати
    
    setAutoSaveTimeout(timeout);
  };

  const handleSave = async () => {
    if (!pageId) return;

    try {
      setSaveStatus('saving');
      await updatePageMutation.mutateAsync({
        title: title.trim() || 'Без названия',
        content,
      });
      setSaveStatus('saved');
      setLastSaved(new Date());
      // НЕ закрываем окно редактирования - setIsEditing(false);
      toast.success('Страница сохранена!');
      
      // Сбрасываем статус через 3 секунды
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      setSaveStatus('error');
      toast.error('Ошибка сохранения страницы');
    }
  };

  const handleBack = () => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}`);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Страница не найдена</h3>
            <p className="mt-1 text-sm text-gray-500">
              Возможно, страница была удалена или у вас нет доступа к ней.
            </p>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Вернуться назад
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <DocumentIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-medium text-gray-900">
                {typeof page.title === 'string' ? page.title : 'Без названия'}
              </h1>
              <p className="text-sm text-gray-500">
                в {typeof page.workspace_name === 'string' ? page.workspace_name : 'Рабочем пространстве'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing && (
              <>
                                  <button
                    onClick={() => {
                      setTitle(typeof page.title === 'string' ? page.title : '');
                      setContent(typeof page.content === 'string' ? page.content : '');
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Отмена
                  </button>
                <button
                  onClick={handleSave}
                  disabled={updatePageMutation.isPending}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatePageMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Редактировать
              </button>
            )}

            <button 
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
            
            {/* Индикатор автосохранения */}
            <AutoSaveIndicator
              status={saveStatus}
              lastSaved={lastSaved}
              onRetry={handleSave}
            />
          </div>
        </div>
      </div>

                   {/* Content */}
             <div className="flex-1 p-6 bg-gray-50">
               <div className="max-w-4xl mx-auto">
                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название страницы
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { 
                      setTitle(e.target.value); 
                      setIsEditing(true); 
                      handleTyping(); // Отмечаем активность печати
                      scheduleAutoSave(); // Запускаем автосохранение
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите название страницы..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Содержимое
                  </label>
                  <RichTextEditor
                    content={content}
                    onChange={(html: string) => { 
                      setContent(html); 
                      setIsEditing(true); 
                      handleTyping(); // Отмечаем активность печати
                      scheduleAutoSave(); // Запускаем автосохранение
                    }}
                    placeholder="Начните писать..."
                    className="min-h-[400px]"
                  />
                </div>
                

              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {typeof page.title === 'string' ? page.title : 'Без названия'}
                  </h1>
                </div>
                <div className="content-display">
                  {page.content && typeof page.content === 'string' ? (
                    <div 
                      className="content-display"
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                  ) : (
                    <div className="text-gray-400 italic text-center py-12">
                      Эта страница пуста. Нажмите "Редактировать", чтобы добавить содержимое.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Share Modal */}
      <SharePageModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        pageId={pageId || ''}
        pageTitle={typeof page?.title === 'string' ? page.title : 'Без названия'}
      />
    </div>
  );
};

export default PageEditor;
