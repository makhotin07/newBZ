import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DocumentIcon, 
  ShareIcon,
  EllipsisHorizontalIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { usePage, useUpdatePage } from '../hooks/useNotes';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SharePageModal from '../components/pages/SharePageModal';
import PageComments from '../components/pages/PageComments';
import toast from 'react-hot-toast';

const PageEditor: React.FC = () => {
  const { pageId, workspaceId } = useParams<{ pageId: string; workspaceId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(true);

  const { data: page, isLoading, error } = usePage(pageId || '');
  const updatePageMutation = useUpdatePage(pageId || '');

  useEffect(() => {
    if (page) {
      setTitle(typeof page.title === 'string' ? page.title : '');
      setContent(typeof page.content === 'string' ? page.content : '');
    }
  }, [page]);

  const handleSave = async () => {
    if (!pageId) return;

    try {
      await updatePageMutation.mutateAsync({
        title: title.trim() || 'Без названия',
        content,
      });
      toast.success('Страница сохранена!');
      setIsEditing(false);
    } catch (error: any) {
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
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-lg ${showComments ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              title="Комментарии"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 bg-gray-50 flex">
        <div className={`flex-1 max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 ${showComments ? 'mr-4' : ''}`}>
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название страницы
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите название страницы..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Содержимое
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Начните писать..."
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
                <div className="prose max-w-none">
                  {page.content && typeof page.content === 'string' ? (
                    <div className="whitespace-pre-wrap text-gray-700 leading-7">
                      {page.content}
                    </div>
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
        {showComments && (
          <div className="w-80 border border-gray-200 bg-white rounded-lg h-fit self-start">
            <PageComments pageId={pageId || ''} onClose={() => setShowComments(false)} />
          </div>
        )}
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
