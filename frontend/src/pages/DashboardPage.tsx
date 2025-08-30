import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  DocumentIcon,
  TableCellsIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useCreatePage, useRecentPages } from '../shared/hooks/useNotes';
import { useCreateDatabase } from '../shared/hooks/useDatabases';
import { useCreateTaskBoard } from '../shared/hooks/useTasks';
import { useAnalyticsOverview } from '../shared/hooks/useWorkspaces';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const createPageMutation = useCreatePage();
  const createDatabaseMutation = useCreateDatabase();
  const createTaskBoardMutation = useCreateTaskBoard();

  // Real data hooks
  const { data: recentPagesData } = useRecentPages(workspaceId || '', 5);
  const { data: overview } = useAnalyticsOverview({ workspaces: workspaceId ? [workspaceId] : undefined });

  const handleCreatePage = async () => {
    if (!workspaceId) {
      // Если нет workspaceId, перенаправляем на выбор workspace
      toast.error('Выберите рабочее пространство для создания страницы');
      return;
    }

    try {
      const newPage = await createPageMutation.mutateAsync({
        title: 'Новая страница',
        content: '',
        workspace: workspaceId,
        permissions: 'workspace',
        is_template: false,
        position: 0
      });
      
      navigate(`/workspace/${workspaceId}/page/${newPage.id}`);
      toast.success('Страница создана!');
    } catch (error: any) {
      toast.error('Ошибка создания страницы');
    }
  };

  const handleCreateDatabase = async () => {
    if (!workspaceId) {
      toast.error('Выберите рабочее пространство для создания базы данных');
      return;
    }

    try {
      const newDatabase = await createDatabaseMutation.mutateAsync({
        title: 'Новая база данных',
        description: '',
        workspace: workspaceId,
        icon: '',
        default_view: 'table'
      });
      
      navigate(`/workspace/${workspaceId}/database/${newDatabase.id}`);
      toast.success('База данных создана!');
    } catch (error: any) {
      toast.error('Ошибка создания базы данных');
    }
  };

  const handleCreateTaskBoard = async () => {
    if (!workspaceId) {
      toast.error('Выберите рабочее пространство для создания доски задач');
      return;
    }

    try {
      const newBoard = await createTaskBoardMutation.mutateAsync({
        title: 'Новая доска задач',
        description: '',
        workspace: workspaceId
      });
      
      navigate(`/workspace/${workspaceId}/tasks/${(newBoard as any).id}`);
      toast.success('Доска задач создана!');
    } catch (error: any) {
      toast.error('Ошибка создания доски задач');
    }
  };
  const quickStats = [
    { name: 'Страницы', value: (overview?.pages?.total ?? 0).toString(), icon: DocumentIcon, color: 'text-blue-600' },
    { name: 'Базы данных', value: (overview?.databases?.total ?? 0).toString(), icon: TableCellsIcon, color: 'text-green-600' },
    { name: 'Задачи', value: (overview?.tasks?.total ?? 0).toString(), icon: ClipboardDocumentListIcon, color: 'text-yellow-600' },
    { name: 'Участники', value: (overview?.members?.total ?? 0).toString(), icon: UsersIcon, color: 'text-purple-600' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Доброе утро! 👋
          </h1>
          <p className="text-gray-600">
            Вот что происходит в вашем рабочем пространстве сегодня.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
              <div className="space-y-3">
                <button 
                  onClick={handleCreatePage}
                  className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
                >
                  <DocumentIcon className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Новая страница</p>
                    <p className="text-sm text-gray-500">Создать новый документ</p>
                  </div>
                </button>
                <button 
                  onClick={handleCreateDatabase}
                  className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
                >
                  <TableCellsIcon className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Новая база данных</p>
                    <p className="text-sm text-gray-500">Создать структурированную таблицу</p>
                  </div>
                </button>
                <button 
                  onClick={handleCreateTaskBoard}
                  className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
                >
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-3 text-yellow-600" />
                  <div>
                    <p className="font-medium">Новая доска задач</p>
                    <p className="text-sm text-gray-500">Организуйте свои задачи</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Последняя активность</h2>
                <Link to="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Смотреть все
                </Link>
              </div>
              <div className="space-y-4">
                {recentPagesData?.length ? (
                  recentPagesData.map((page: any) => {
                    console.log('Page:', page);
                    if (!page || typeof page !== 'object') {
                      console.warn('Invalid page:', page);
                      return null;
                    }
                    return (
                      <div key={page.id || 'неизвестно'} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <DocumentIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{page.title || 'Без названия'}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{page.workspace_name || 'Неизвестное пространство'}</span>
                            <span className="mx-1">•</span>
                            <span>{page.updated_at ? new Date(page.updated_at).toLocaleDateString('ru-RU') : 'Неизвестно'}</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <Link
                            to={`/workspace/${typeof page.workspace === 'string' ? page.workspace : 'неизвестно'}/page/${page.id || 'неизвестно'}`}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Открыть
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm">Пока нет страниц</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Предстоящие задачи</h2>
                <Link to="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Смотреть все
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center p-3 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
                  <CalendarIcon className="w-4 h-4 text-red-600 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Рассмотреть предложение проекта</p>
                    <p className="text-xs text-gray-500">До выполнения 2 часа</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Высокий</span>
                </div>
                <div className="flex items-center p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                  <CalendarIcon className="w-4 h-4 text-yellow-600 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Обновить команду о прогрессе</p>
                    <p className="text-xs text-gray-500">До завтра</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Средний</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
