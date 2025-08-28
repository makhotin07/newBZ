import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentIcon, 
  ClipboardDocumentListIcon,
  TableCellsIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceSelector from '../workspace/WorkspaceSelector';
 

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const navItems = [
    { name: 'Главная', href: '/', icon: HomeIcon },
    { name: 'Настройки', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Workspace-specific navigation
  const workspaceNavItems = workspaceId ? [
    { name: 'Страницы', href: `/workspace/${workspaceId}`, icon: DocumentIcon },
    { name: 'Базы данных', href: `/workspace/${workspaceId}/databases`, icon: TableCellsIcon },
    { name: 'Доски задач', href: `/workspace/${workspaceId}/tasks`, icon: ClipboardDocumentListIcon },
    { name: 'Настройки', href: `/workspace/${workspaceId}/settings`, icon: Cog6ToothIcon },
  ] : [];

  return (
    <div className="sidebar">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">N</span>
          </div>
          <span className="font-semibold text-lg">Заметки</span>
        </div>

        {/* User info */}
        <div className="flex items-center space-x-2 mb-6 p-2 rounded-lg hover:bg-gray-100">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {user?.first_name?.charAt(0) || user?.email?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || user?.email}
            </p>
          </div>
        </div>

        {/* Workspace Selector - Custom style to fit sidebar */}
        <div className="mb-4 -m-4">
          <WorkspaceSelector />
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}

          {/* Workspace Navigation */}
          {workspaceId && workspaceNavItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-1">
                {workspaceNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || 
                    (item.href.includes('/databases') && location.pathname.includes('/database/')) ||
                    (item.href.includes('/tasks') && location.pathname.includes('/tasks/'));
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions removed per request */}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
