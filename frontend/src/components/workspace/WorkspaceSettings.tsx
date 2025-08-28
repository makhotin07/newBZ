import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace, useWorkspaceSettings, useUpdateWorkspaceSettings } from '../../hooks/useWorkspaces';
import { useNavigate } from 'react-router-dom';
import WorkspaceMembers from './WorkspaceMembers';
import EmojiPicker from '../ui/EmojiPicker';
import LoadingSpinner from '../ui/LoadingSpinner';

interface WorkspaceSettingsProps {
  workspaceId: string;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ workspaceId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  
  // General settings state
  const [generalForm, setGeneralForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#6366F1',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Permissions state  
  const [permissionsForm, setPermissionsForm] = useState({
    allow_member_invites: true,
    allow_public_pages: false,
    default_page_permissions: 'workspace' as 'private' | 'workspace' | 'public',
    enable_comments: true,
    enable_page_history: true,
  });

  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId);
  const { data: settings, isLoading: settingsLoading } = useWorkspaceSettings(workspaceId);
  const updateWorkspaceMutation = useUpdateWorkspace(workspaceId);
  const updateSettingsMutation = useUpdateWorkspaceSettings(workspaceId);
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937',
  ];

  const tabs = ['Общее', 'Участники', 'Права', 'Опасная зона'];

  // Initialize forms when data loads
  useEffect(() => {
    if (workspace) {
      setGeneralForm({
        name: workspace.name,
        description: workspace.description || '',
        icon: workspace.icon || '',
        color: workspace.color,
      });
    }
  }, [workspace]);

  useEffect(() => {
    if (settings) {
      setPermissionsForm({
        allow_member_invites: settings.allow_member_invites,
        allow_public_pages: settings.allow_public_pages,
        default_page_permissions: settings.default_page_permissions,
        enable_comments: settings.enable_comments,
        enable_page_history: settings.enable_page_history,
      });
    }
  }, [settings]);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!generalForm.name.trim()) return;

    try {
      await updateWorkspaceMutation.mutateAsync({
        name: generalForm.name.trim(),
        description: generalForm.description.trim() || undefined,
        icon: generalForm.icon || undefined,
        color: generalForm.color,
      });
    } catch (error) {
      console.error('Failed to update workspace:', error);
    }
  };

  const handlePermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettingsMutation.mutateAsync(permissionsForm);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace) return;

    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Workspace not found</p>
      </div>
    );
  }

  const canManageWorkspace = workspace.member_role && ['owner', 'admin'].includes(workspace.member_role);
  const isOwner = workspace.member_role === 'owner';

  if (!canManageWorkspace) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">You don't have permission to manage this workspace.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <Cog6ToothIcon className="w-8 h-8" />
          <span>Настройки рабочего пространства</span>
        </h1>
        <p className="text-gray-600 mt-2">Управляйте конфигурацией рабочего пространства и участниками</p>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
          {tabs.map((tab, index) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                 ${selected
                   ? 'bg-white text-blue-700 shadow'
                   : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                 }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* General Settings */}
          <Tab.Panel>
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Общая информация</h3>

                {/* Icon and Color */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: generalForm.color }}
                    >
                      {generalForm.icon || generalForm.name.charAt(0) || '?'}
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute top-full left-0 mt-2 z-20">
                        <EmojiPicker
                          onEmojiSelect={(emoji) => {
                            setGeneralForm(prev => ({ ...prev, icon: emoji }));
                            setShowEmojiPicker(false);
                          }}
                          onClose={() => setShowEmojiPicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цветовая тема
                    </label>
                    <div className="grid grid-cols-10 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setGeneralForm(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            generalForm.color === color
                              ? 'border-gray-400 scale-110'
                              : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Название пространства *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    id="description"
                    value={generalForm.description}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateWorkspaceMutation.isPending}
                  className="btn-primary"
                >
                  {updateWorkspaceMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </Tab.Panel>

          {/* Members */}
          <Tab.Panel>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <WorkspaceMembers 
                workspaceId={workspaceId}
                currentUserRole={workspace.member_role}
              />
            </div>
          </Tab.Panel>

          {/* Permissions */}
          <Tab.Panel>
            <form onSubmit={handlePermissionsSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Права и доступ</h3>

                <div className="space-y-4">
                  {/* Member Invites */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Разрешить приглашения участников</h4>
                      <p className="text-sm text-gray-500">Позволить редакторам приглашать новых участников</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissionsForm.allow_member_invites}
                        onChange={(e) => setPermissionsForm(prev => ({ ...prev, allow_member_invites: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Public Pages */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Разрешить публичные страницы</h4>
                      <p className="text-sm text-gray-500">Включить публикацию страниц в вебе</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissionsForm.allow_public_pages}
                        onChange={(e) => setPermissionsForm(prev => ({ ...prev, allow_public_pages: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Default Page Permissions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Права по умолчанию для новых страниц</h4>
                    <p className="text-sm text-gray-500 mb-3">Видимость по умолчанию для новых страниц</p>
                    <select
                      value={permissionsForm.default_page_permissions}
                      onChange={(e) => setPermissionsForm(prev => ({ ...prev, default_page_permissions: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="private">Приватно — только вы</option>
                      <option value="workspace">Рабочее пространство — все участники</option>
                      {permissionsForm.allow_public_pages && (
                        <option value="public">Публично — любой по ссылке</option>
                      )}
                    </select>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Разрешить комментарии</h4>
                      <p className="text-sm text-gray-500">Позволить участникам комментировать страницы</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissionsForm.enable_comments}
                        onChange={(e) => setPermissionsForm(prev => ({ ...prev, enable_comments: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Page History */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="textсм font-medium text-gray-900">Включить историю изменений</h4>
                      <p className="text-sm text-gray-500">Хранить историю версий страниц</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissionsForm.enable_page_history}
                        onChange={(e) => setPermissionsForm(prev => ({ ...prev, enable_page_history: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="btn-primary mt-6"
                >
                  {updateSettingsMutation.isPending ? 'Сохранение...' : 'Сохранить права'}
                </button>
              </div>
            </form>
          </Tab.Panel>

          {/* Danger Zone */}
          <Tab.Panel>
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>Опасная зона</span>
              </h3>

              {isOwner ? (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Удалить рабочее пространство</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Удаление необратимо: будут удалены все страницы, базы данных, задачи и участники.
                    </p>
                    
                    {!showDeleteConfirmation ? (
                      <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Удалить рабочее пространство
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-red-900">
                          Введите "{workspace.name}" для подтверждения удаления:
                        </p>
                        <input
                          type="text"
                          placeholder={workspace.name}
                          className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          onKeyUp={(e) => {
                            if (e.currentTarget.value === workspace.name) {
                              e.currentTarget.style.borderColor = '#10B981';
                            } else {
                              e.currentTarget.style.borderColor = '';
                            }
                          }}
                        />
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setShowDeleteConfirmation(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="' + workspace.name + '"]') as HTMLInputElement;
                              if (input?.value === workspace.name) {
                                handleDeleteWorkspace();
                              }
                            }}
                            disabled={deleteWorkspaceMutation.isPending}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {deleteWorkspaceMutation.isPending ? 'Удаление...' : 'Я понимаю, удалить это пространство'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Только владелец рабочего пространства может удалить его.
                  </p>
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default WorkspaceSettings;
