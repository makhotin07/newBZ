import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useUserProfile, useUpdateUserProfile, useChangePassword, useUploadAvatar } from '../shared/hooks/useUser';
import { UpdateUserData, ChangePasswordData } from '../features/auth/api';
import LoadingSpinner from '../shared/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { data: user, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const changePasswordMutation = useChangePassword();
  const uploadAvatarMutation = useUploadAvatar();

  const [profileForm, setProfileForm] = useState<UpdateUserData>({});
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Initialize form when user data loads
  React.useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        timezone: user.timezone || 'UTC',
        theme_preference: user.theme_preference || 'system',
        profile: {
          phone: user.profile?.phone || '',
          company: user.profile?.company || '',
          job_title: user.profile?.job_title || '',
          website: user.profile?.website || '',
          notification_preferences: {
            email_notifications: user.profile?.notification_preferences?.email_notifications ?? true,
            push_notifications: user.profile?.notification_preferences?.push_notifications ?? true,
            task_reminders: user.profile?.notification_preferences?.task_reminders ?? true,
            workspace_invites: user.profile?.notification_preferences?.workspace_invites ?? true,

          }
        }
      });
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Новые пароли не совпадают');
      return;
    }

    changePasswordMutation.mutate(passwordForm, {
      onSuccess: () => {
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла должен быть меньше 5MB');
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { name: 'Профиль', icon: UserIcon },
    { name: 'Уведомления', icon: BellIcon },
    { name: 'Безопасность', icon: ShieldCheckIcon },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Настройки
        </h1>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                     ${selected
                       ? 'bg-white text-blue-700 shadow'
                       : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                     }`
                  }
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </div>
                </Tab>
              );
            })}
          </Tab.List>

          <Tab.Panels>
            {/* Profile Settings */}
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Настройки профиля</h2>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <PhotoIcon className="w-4 h-4 mr-2" />
                        Изменить фото
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadAvatarMutation.isPending}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Изображения до 5MB в формате JPG, PNG или GIF
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* First Name */}
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Имя
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        value={profileForm.first_name || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Фамилия
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        value={profileForm.last_name || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Для изменения email обратитесь в поддержку
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      О себе
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={profileForm.bio || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Расскажите немного о себе..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Timezone */}
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                        Часовой пояс
                      </label>
                      <select
                        id="timezone"
                        value={profileForm.timezone || 'UTC'}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="Europe/Moscow">Europe/Moscow</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                        Тема
                      </label>
                      <select
                        id="theme"
                        value={profileForm.theme_preference || 'system'}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          theme_preference: e.target.value as 'light' | 'dark' | 'system' 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="system">Системная</option>
                        <option value="light">Светлая</option>
                        <option value="dark">Тёмная</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Profile Fields */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Компания
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={profileForm.profile?.company || ''}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          profile: { ...prev.profile, company: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                        Должность
                      </label>
                      <input
                        type="text"
                        id="job_title"
                        value={profileForm.profile?.job_title || ''}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          profile: { ...prev.profile, job_title: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary"
                  >
                    {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                </form>
              </div>
            </Tab.Panel>

            {/* Notification Settings */}
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Настройки уведомлений</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'Email уведомления', description: 'Получать уведомления по электронной почте' },
                    { key: 'push_notifications', label: 'Push уведомления', description: 'Показывать уведомления в браузере' },
                    { key: 'task_reminders', label: 'Напоминания о задачах', description: 'Уведомления о сроках задач' },
                    { key: 'workspace_invites', label: 'Приглашения в рабочие пространства', description: 'Уведомления о приглашениях' },

                  ].map((setting) => (
                    <div key={setting.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={setting.key}
                        checked={profileForm.profile?.notification_preferences?.[setting.key as keyof typeof profileForm.profile.notification_preferences] ?? true}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            notification_preferences: {
                              ...prev.profile?.notification_preferences,
                              [setting.key]: e.target.checked
                            }
                          }
                        }))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor={setting.key} className="text-sm font-medium text-gray-700">
                          {setting.label}
                        </label>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleProfileSubmit}
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary"
                  >
                    {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить настройки'}
                  </button>
                </div>
              </div>
            </Tab.Panel>

            {/* Security Settings */}
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Безопасность</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Текущий пароль
                    </label>
                    <input
                      type="password"
                      id="old_password"
                      value={passwordForm.old_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, old_password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      minLength={8}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Минимум 8 символов</p>
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Подтвердите новый пароль
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      minLength={8}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="btn-primary"
                  >
                    {changePasswordMutation.isPending ? 'Изменение...' : 'Изменить пароль'}
                  </button>
                </form>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default SettingsPage;
