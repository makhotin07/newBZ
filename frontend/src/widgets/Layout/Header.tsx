import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import GlobalSearch from '../../features/search/ui/search/GlobalSearch';
import NotificationPanel from '../../features/notifications/ui/notifications/NotificationPanel';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions = [
    { key: 'light', label: 'Светлая', icon: SunIcon },
    { key: 'dark', label: 'Тёмная', icon: MoonIcon },
    { key: 'auto', label: 'Авто', icon: ComputerDesktopIcon },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <GlobalSearch workspaceId={workspaceId} />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {isDark ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
            
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="py-1">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        onClick={() => {
                          setTheme(option.key as any);
                          setShowThemeMenu(false);
                        }}
                        className={`
                          flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100
                          ${theme === option.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                        `}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationPanel />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-medium">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium">{user?.first_name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="py-1">
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Настройки
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
